const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let goServerProcess = null;

function startGoServer() {
  const exePath = path.join(__dirname, '..', '..', 'pvc-server.exe');
  if (fs.existsSync(exePath)) {
    console.log('Launching Go backend executable:', exePath);
    try {
      goServerProcess = spawn(exePath, [], {
        cwd: path.dirname(exePath),
        detached: false,
        stdio: 'ignore'
      });
      goServerProcess.on('error', (err) => {
        console.error('Go backend process error:', err);
      });
    } catch (e) {
      console.error('Failed to spawn Go server:', e);
    }
  } else {
    console.log('Go server executable not found at:', exePath, '. Running in frontend standalone or dev mode.');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false, // Frameless window with custom titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Check if dev server is running on localhost:5173
    const devUrl = 'http://localhost:5173';
    fetch(devUrl)
      .then(() => mainWindow.loadURL(devUrl))
      .catch(() => {
        const distPath = path.join(__dirname, '..', 'dist', 'index.html');
        if (fs.existsSync(distPath)) {
          mainWindow.loadFile(distPath);
        } else {
          mainWindow.loadURL('http://localhost:5173');
        }
      });
  }

  // Window Controls IPC
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  // Printer Management IPC
  ipcMain.handle('get-printers', async () => {
    try {
      const printers = await mainWindow.webContents.getPrintersAsync();
      return printers.map(p => ({
        name: p.name,
        isDefault: p.isDefault,
        status: p.status,
        displayName: p.displayName || p.name
      }));
    } catch (err) {
      console.error('Error fetching printers:', err);
      return [];
    }
  });

  ipcMain.handle('print-card', async (event, options) => {
    return new Promise((resolve) => {
      if (!mainWindow) return resolve({ success: false, error: 'No main window' });

      const printOptions = {
        silent: options?.silent || false,
        printBackground: true,
        deviceName: options?.deviceName || '',
        color: true,
        margins: { marginType: 'none' },
        landscape: options?.landscape ?? true,
        scaleFactor: options?.scaleFactor || 100,
        pageSize: options?.pageSize || { width: 85600, height: 53980 } // CR80 standard microns
      };

      mainWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          resolve({ success: false, error: failureReason });
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  // Native File Dialog IPC
  ipcMain.handle('show-save-dialog', async (event, options) => {
    return await dialog.showSaveDialog(mainWindow, options);
  });

  ipcMain.handle('show-open-dialog', async (event, options) => {
    return await dialog.showOpenDialog(mainWindow, options);
  });

  ipcMain.handle('save-file-content', async (event, { filepath, content }) => {
    try {
      fs.writeFileSync(filepath, content, 'utf-8');
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('read-file-content', async (event, filepath) => {
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      return { success: true, content };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
}

app.whenReady().then(() => {
  startGoServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (goServerProcess) {
    try {
      goServerProcess.kill();
    } catch (e) {}
  }
  if (process.platform !== 'darwin') app.quit();
});
