// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    writeFile: (filename, content) => ipcRenderer.invoke('write-file', { filename, content })
});
