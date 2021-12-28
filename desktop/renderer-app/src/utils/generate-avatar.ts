// Generate Avatar base on uid
// vite should replace require.context
// detail see: https://vitejs.dev/guide/features.html#glob-import

const images = import.meta.glob("../assets/image/default-avatars/*.png");
const keys = Object.keys(images);
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
    return keys[index];
};
