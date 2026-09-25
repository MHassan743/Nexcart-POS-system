const { app, BrowserWindow } = require('electron');
const path = require('path');

// When packaged, set extra DLL search paths so Windows can find
// ffmpeg.dll, libGLESv2.dll, etc. from process.resourcesPath
if (app.isPackaged) {
  // resourcesPath = C:\Users\...\AppData\Local\Programs\Nexcart POS System\resources
  const resourcesPath = process.resourcesPath;
  // Node's path is already set, but we tell Chromium where to look for its DLLs
  app.commandLine.appendSwitch('no-sandbox');
  process.env.PATH = resourcesPath + ';' + (process.env.PATH || '');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Nexcart POS System - Universal Anti-Leakage Retail Platform',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
