// main.js

const { app, BrowserWindow, Menu, dialog, ipcMain, globalShortcut, session } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs/promises'); // Use fs.promises for async file operations
const { updateElectronApp } = require('update-electron-app');

updateElectronApp(); // additional configuration options available

if (require('electron-squirrel-startup')) app.quit(); //handle electron squirrel

// Keep a global reference of the window object.
// Use an array if your app supports multiple windows.
const windows = [];

// Disable default application menu (optional, based on your original code)
Menu.setApplicationMenu(null);

// Store initial arguments for later retrieval by the renderer
let initialAppArguments = process.argv;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: './icons/icon.png', // Set your icon path
    width: 1200, // Set your desired default width
    height: 800, // Set your desired default height
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // IMPORTANT: contextIsolation should be true for security
      contextIsolation: true,
      // IMPORTANT: nodeIntegration should be false for security with contextIsolation
      nodeIntegration: false,
      // Enable nativeWindowOpen if your content needs to open new browser windows
      nativeWindowOpen: true,
      webviewTag: false,
      // Add these settings for iframes
      additionalArguments: ['--enable-features=IsolateOrigins'],
      webSecurity: true
    }
  });

  windows.push(mainWindow);
  
  session.defaultSession.setPreloads([path.join(__dirname, 'preload.js')]);

  const htmlFilePath = path.join(app.getAppPath(), 'site', 'circuitjs.html');

  // Load the HTML file for the app.
  mainWindow.loadURL(url.format({
    //pathname: path.join(__dirname, '..', 'site/circuitjs.html'), // For automatic builds
    //pathname: path.join(__dirname, 'site/circuitjs.html'), // For manual builds
    pathname: htmlFilePath,
    protocol: 'file:',
    slashes: true
  }));



  // Register DevTools shortcut
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    mainWindow.webContents.toggleDevTools();
  });


  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object.
    const i = windows.indexOf(mainWindow);
    if (i > -1) {
      windows.splice(i, 1);
    }
  });

  // Handle new-window events for Electron's browser windows
  mainWindow.webContents.on('new-window', (evt, newUrl, frameName, disposition, options) => {
    if (disposition === 'save-to-disk') {
      return; // Let Electron handle save-to-disk disposition
    }
    if (!newUrl.endsWith("circuitjs.html")) {
      return; // Only handle new windows for your specific HTML
    }

    evt.preventDefault(); // Prevent default Electron new window behavior
    createWindow(); // Create a new browser window using your function
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers (for communication with renderer process) ---

ipcMain.handle('show-save-dialog', async (event, options) => {
  const focusedWindow = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(focusedWindow, options);
  return { canceled, filePath };
});

ipcMain.handle('save-file', async (event, filePath, text) => {
  try {
    await fs.writeFile(filePath, text, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const focusedWindow = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(focusedWindow, options);
  return { canceled, filePaths };
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return { success: true, data };
  } catch (error) {
    console.error('Failed to read file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('toggle-devtools', (event) => {
  event.sender.toggleDevTools();
});

ipcMain.handle('get-initial-app-arguments', () => {
  return initialAppArguments;
});