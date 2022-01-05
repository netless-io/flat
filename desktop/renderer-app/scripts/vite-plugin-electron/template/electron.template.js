// We will use hack method to bundle file and export it with ESM
const {
    clipboard,
    nativeImage,
    shell,
    contextBridge,
    crashReporter,
    ipcRenderer,
    webFrame,
    desktopCapturer,
} = require('electron');
export {
    clipboard,
    nativeImage,
    shell,
    contextBridge,
    crashReporter,
    ipcRenderer,
    webFrame,
    desktopCapturer,
}
export default { clipboard, nativeImage, shell, contextBridge, crashReporter, ipcRenderer, webFrame, desktopCapturer };
