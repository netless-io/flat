const avatarModules = import.meta.globEager(`../assets/image/default-avatars/*.png`);
const keys = Object.keys(avatarModules);

/** Generate Avatar base on uid */
export const generateAvatar = (uid: string): string => {
    let index = 0;
    if (uid) {
        for (let i = uid.length - 1; i >= 0; i--) {
            index += uid.charCodeAt(i);
        }
        index = index % keys.length;
    } else {
        index = Math.floor(Math.random() * keys.length);
    }
    return avatarModules[keys[index]].default;
};
