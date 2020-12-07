const req = require.context("../assets/image/default-avatars/", false, /\.png$/);
const keys = req.keys();

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
    return req(keys[index]).default;
};
