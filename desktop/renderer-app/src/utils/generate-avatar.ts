import index0PNG from "../assets/image/default-avatars/0.png";
import index1PNG from "../assets/image/default-avatars/1.png";
import index2PNG from "../assets/image/default-avatars/2.png";
import index3PNG from "../assets/image/default-avatars/3.png";
import index4PNG from "../assets/image/default-avatars/4.png";

const defaultAvatars = [index0PNG, index1PNG, index2PNG, index3PNG, index4PNG];

/** Generate Avatar base on uid */
export const generateAvatar = (uid: string): string => {
    let index = 0;
    if (uid) {
        for (let i = uid.length - 1; i >= 0; i--) {
            index += uid.charCodeAt(i);
        }
        index = index % defaultAvatars.length;
    } else {
        index = Math.floor(Math.random() * defaultAvatars.length);
    }
    return defaultAvatars[index];
};
