// electron.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL || `file://${path.join(__dirname, 'dist/index.html')}`);

    if (!process.env.WEBPACK_DEV_SERVER_URL) {
        mainWindow.webContents.openDevTools();
    }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('write-file', async (event, { filename, content }) => {
    const filePath = path.join(app.getPath('documents'), filename);
    return fs.promises.writeFile(filePath, content)
        .then(() => 'File written successfully')
        .catch((error) => `Error writing file: ${error.message}`);
});
