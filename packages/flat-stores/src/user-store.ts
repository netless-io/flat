import { action, makeAutoObservable, observable } from "mobx";
import { usersInfo, CloudRecordStartPayload } from "@netless/flat-server-api";
import { preferencesStore } from "./preferences-store";
import { isEmpty } from "lodash-es";

export interface User {
    // key
    userUUID: string;
    // static info, can be cached
    rtcUID: string;
    avatar: string;
    name: string;
    // state, should keep
    camera: boolean;
    mic: boolean;
    isSpeak: boolean;
    wbOperate: boolean;
    isRaiseHand: boolean;
    hasLeft: boolean;
}

export type RecordingConfig = Required<
    CloudRecordStartPayload["agoraData"]["clientRequest"]
>["recordingConfig"];

/**
 * Manage users in a classroom
 */
export class UserStore {
    public readonly roomUUID: string;
    /** Current user UUID */
    public readonly userUUID: string;
    /** Room owner UUID */
    public readonly ownerUUID: string;
    /** cache all users info including users who have left the room */
    public cachedUsers = observable.map<string, User>();
    /** creator info */
    public creator: User | null = null;
    /** current user info */
    public currentUser: User | null = null;
    /** joiners who have speaking access */
    public speakingJoiners = observable.array<User>([]);
    /** joiners who are raising hands */
    public handRaisingJoiners = observable.array<User>([]);
    /** the rest joiners */
    public otherJoiners = observable.array<User>([]);

    public get joiners(): User[] {
        return [...this.speakingJoiners, ...this.handRaisingJoiners, ...this.otherJoiners];
    }

    public get totalUserCount(): number {
        return (
            (this.creator && !this.creator.hasLeft ? 1 : 0) +
            (this.speakingJoiners.length +
                this.handRaisingJoiners.length +
                this.otherJoiners.length)
        );
    }

    public get isCreator(): boolean {
        return this.ownerUUID === this.userUUID;
    }

    public isInRoom: (userUUID: string) => boolean;

    public constructor(config: {
        userUUID: string;
        ownerUUID: string;
        roomUUID: string;
        isInRoom: (userUUID: string) => boolean;
    }) {
        this.roomUUID = config.roomUUID;
        this.userUUID = config.userUUID;
        this.ownerUUID = config.ownerUUID;
        this.isInRoom = config.isInRoom;

        makeAutoObservable(this);
    }

    // If provided `onStageUserUUIDs`, other users will be lazily initialized.
    public initUsers = async (userUUIDs: string[], onStageUserUUIDs?: string[]): Promise<void> => {
        this.otherJoiners.clear();
        this.speakingJoiners.clear();
        this.handRaisingJoiners.clear();
        const users = await this.createUsers(onStageUserUUIDs || userUUIDs);
        users.forEach(user => {
            this.sortUser(user);
            this.cacheUser(user);
        });
        if (onStageUserUUIDs) {
            const lazyUsers = userUUIDs.filter(userUUID => !onStageUserUUIDs.includes(userUUID));
            this.createLazyUsers(lazyUsers);
        }
    };

    public addUser = async (userUUID: string, force = false): Promise<User> => {
        if (this.cachedUsers.has(userUUID)) {
            this.removeUser(userUUID);
        }
        let user: User;
        if (force) {
            user = (await this.createUsers([userUUID]))[0];
            this.cacheUser(user);
            this.sortUser(user);
        } else {
            user = this.createLazyUsers([userUUID], true)[0];
        }
        return user;
    };

    public removeUser = (userUUID: string): void => {
        if (this.creator && this.creator.userUUID === userUUID) {
            this.creator.hasLeft = true;
            // always show creator
            // this.creator = null;
        } else {
            for (const { group } of this.joinerGroups) {
                for (let i = 0; i < this[group].length; i++) {
                    if (this[group][i].userUUID === userUUID) {
                        this[group][i].hasLeft = true;
                        this[group].splice(i, 1);
                        break;
                    }
                }
            }
        }
    };

    /**
     * Update users states and sort into different groups automatically.
     * @param editUser Update user state. This callback will be applied on all users.
     * Return `false` to stop traversing.
     */
    public updateUsers = (editUser: (user: User) => boolean | void): void => {
        const editUserAction = action("editUser", editUser);
        const unSortedUsers: User[] = [];

        let shouldStopEditUser = false;

        if (this.creator) {
            shouldStopEditUser = editUserAction(this.creator) === false;
        }

        for (const { group, shouldMoveOut } of this.joinerGroups) {
            if (shouldStopEditUser) {
                break;
            }

            for (let i = 0; i < this[group].length; i++) {
                if (shouldStopEditUser) {
                    break;
                }

                const user = this[group][i];
                shouldStopEditUser = editUserAction(user) === false;
                if (shouldMoveOut(user)) {
                    this[group].splice(i, 1);
                    i--;
                    unSortedUsers.push(user);
                }
            }
        }

        // Sort each unsorted users into different group
        unSortedUsers.forEach(this.sortUser);
    };

    /**
     * Fetch info of users who have left the room.
     * For RTM message title.
     */
    public syncExtraUsersInfo = async (userUUIDs: string[]): Promise<void> => {
        const users = await this.createUsers(
            userUUIDs.filter(userUUID => !this.cachedUsers.has(userUUID)),
        );
        this.cacheUsers(users);
    };

    /**
     * Fetch info of lazily initialized users.
     */
    public flushLazyUsers = async (userUUIDs?: string[]): Promise<void> => {
        if (!userUUIDs) {
            userUUIDs = [];
            for (const user of this.cachedUsers.values()) {
                if (!user.rtcUID) {
                    userUUIDs.push(user.userUUID);
                }
            }
        }
        if (userUUIDs.length === 0) {
            return;
        }
        const users = await this.createUsers(userUUIDs);
        this.cacheUsers(users);
        for (const user of users) {
            this.removeUser(user.userUUID);
            this.sortUser(user);
        }
    };

    /** Return a random joiner that is not current user */
    public pickRandomJoiner = (): User | undefined => {
        const startIndex = Math.floor(Math.random() * this.joiners.length);

        // keep picking until a suitable user is found
        for (let count = 0; count < this.joiners.length; count++) {
            const joiner = this.joiners[(startIndex + count) % this.joiners.length];

            if (joiner && joiner.userUUID !== this.userUUID) {
                return joiner;
            }
        }

        return;
    };

    /**
     * Sort a user into groups.
     * The user object should be an observable.
     * */
    private sortUser = (user: User): void => {
        if (user.userUUID === this.userUUID) {
            this.currentUser = user;
        }

        if (user.userUUID === this.ownerUUID) {
            this.creator = user;
        } else if (user.isSpeak) {
            const index = this.speakingJoiners.findIndex(
                ({ userUUID }) => userUUID === user.userUUID,
            );
            if (index >= 0) {
                this.speakingJoiners.splice(index, 1);
            }
            this.speakingJoiners.push(user);
        } else if (user.isRaiseHand) {
            const index = this.handRaisingJoiners.findIndex(
                ({ userUUID }) => userUUID === user.userUUID,
            );
            if (index >= 0) {
                this.handRaisingJoiners.splice(index, 1);
            }
            this.handRaisingJoiners.push(user);
        } else {
            this.otherJoiners.push(user);
        }
    };

    private cacheUser(user: User): void {
        this.cachedUsers.set(user.userUUID, user);
    }

    private cacheUsers(users: User[]): void {
        for (const user of users) {
            // keep user state from cache
            const cachedUser = this.cachedUsers.get(user.userUUID);
            if (cachedUser) {
                user.camera = cachedUser.camera;
                user.mic = cachedUser.mic;
                user.isSpeak = cachedUser.isSpeak;
                user.wbOperate = cachedUser.wbOperate;
                user.isRaiseHand = cachedUser.isRaiseHand;
                user.hasLeft = !this.isInRoom(user.userUUID);
            }
            this.cacheUser(user);
        }
    }

    /**
     * Fetch users info and return an observable user list
     */
    private async createUsers(userUUIDs: string[]): Promise<User[]> {
        userUUIDs = [...new Set(userUUIDs)];

        if (userUUIDs.length <= 0) {
            return [];
        }

        // The users info may not include all users in userUUIDs.
        const users = await usersInfo({ roomUUID: this.roomUUID, usersUUID: userUUIDs });
        if (isEmpty(users)) {
            return [];
        }

        const result: User[] = [];
        for (const userUUID of userUUIDs) {
            if (users[userUUID]) {
                // must convert to observable first so that it may be reused by other logic
                const user = observable.object<User>({
                    userUUID,
                    rtcUID: String(users[userUUID].rtcUID),
                    avatar: users[userUUID].avatarURL,
                    name: users[userUUID].name,
                    camera: userUUID === this.userUUID ? preferencesStore.autoCameraOn : false,
                    mic: userUUID === this.userUUID ? preferencesStore.autoMicOn : false,
                    isSpeak: userUUID === this.userUUID && this.isCreator,
                    wbOperate: userUUID === this.userUUID && this.isCreator,
                    isRaiseHand: false,
                    hasLeft: !this.isInRoom(userUUID),
                });
                result.push(user);
            }
        }

        return result;
    }

    // Users with empty 'rtcUID' are initialized lazily.
    // If 'force' is true, it will reset these users' states.
    private createLazyUsers(userUUIDs: string[], force = false): User[] {
        const users: User[] = [];
        for (const userUUID of userUUIDs) {
            const cachedUser = this.cachedUsers.get(userUUID);
            if (!force && cachedUser) {
                users.push(cachedUser);
                continue;
            }
            const user = observable.object<User>({
                userUUID,
                rtcUID: cachedUser?.rtcUID || "",
                avatar: cachedUser?.avatar || "",
                name: cachedUser?.name || "",
                camera: false,
                mic: false,
                isSpeak: false,
                wbOperate: false,
                isRaiseHand: false,
                hasLeft: !this.isInRoom(userUUID),
            });
            users.push(user);
            this.sortUser(user);
            this.cacheUser(user);
        }
        return users;
    }

    private readonly joinerGroups = [
        { group: "speakingJoiners", shouldMoveOut: (user: User): boolean => !user.isSpeak },
        { group: "handRaisingJoiners", shouldMoveOut: (user: User): boolean => !user.isRaiseHand },
        {
            group: "otherJoiners",
            shouldMoveOut: (user: User): boolean => user.isRaiseHand || user.isSpeak,
        },
    ] as const;
}
