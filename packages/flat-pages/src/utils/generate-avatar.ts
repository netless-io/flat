import index0PNG from "../assets/image/default-avatars/0.png";
import index1PNG from "../assets/image/default-avatars/1.png";
import index2PNG from "../assets/image/default-avatars/2.png";
import index3PNG from "../assets/image/default-avatars/3.png";
import index4PNG from "../assets/image/default-avatars/4.png";
import index5PNG from "../assets/image/default-avatars/5.png";
import index6PNG from "../assets/image/default-avatars/6.png";
import index7PNG from "../assets/image/default-avatars/7.png";
import index8PNG from "../assets/image/default-avatars/8.png";
import index9PNG from "../assets/image/default-avatars/9.png";
import index10PNG from "../assets/image/default-avatars/10.png";
import index11PNG from "../assets/image/default-avatars/11.png";
import index12PNG from "../assets/image/default-avatars/12.png";
import index13PNG from "../assets/image/default-avatars/13.png";
import index14PNG from "../assets/image/default-avatars/14.png";
import index15PNG from "../assets/image/default-avatars/15.png";
import index16PNG from "../assets/image/default-avatars/16.png";
import index17PNG from "../assets/image/default-avatars/17.png";

const defaultAvatars = [
    index0PNG,
    index1PNG,
    index2PNG,
    index3PNG,
    index4PNG,
    index5PNG,
    index6PNG,
    index7PNG,
    index8PNG,
    index9PNG,
    index10PNG,
    index11PNG,
    index12PNG,
    index13PNG,
    index14PNG,
    index15PNG,
    index16PNG,
    index17PNG,
];

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
