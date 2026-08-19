const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Disable disk cache locks on Windows
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

let mainWindow;
let goServerProcess = null;

function startGoServer() {
  let exePath;
  if (app.isPackaged) {
    exePath = path.join(process.resourcesPath, 'pvc-server.exe');
  } else {
    exePath = path.join(__dirname, '..', '..', 'pvc-server.exe');
    if (!fs.existsSync(exePath)) {
      exePath = path.join(__dirname, '..', 'pvc-server.exe');
    }
    if (!fs.existsSync(exePath)) {
      exePath = path.join(process.cwd(), 'pvc-server.exe');
    }
  }

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
    console.log('Go server executable not found at:', exePath, '. Running in standalone frontend mode.');
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'icon.png');
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false, // Frameless window with custom titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#0f172a',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  const devUrl = 'http://localhost:5173';
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
  const distPath = path.join(__dirname, '..', 'dist', 'index.html');

  if (isDev) {
    console.log('Loading development server URL:', devUrl);
    mainWindow.loadURL(devUrl).catch((err) => {
      console.error('Failed to load dev URL, falling back to dist:', err);
      if (fs.existsSync(distPath)) {
        mainWindow.loadFile(distPath);
      }
    });
  } else {
    if (fs.existsSync(distPath)) {
      console.log('Loading production file:', distPath);
      mainWindow.loadFile(distPath);
    } else {
      console.log('dist/index.html not found, attempting dev URL:', devUrl);
      mainWindow.loadURL(devUrl);
    }
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Renderer Load Failed] ${errorCode}: ${errorDescription} at ${validatedURL}`);
  });

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
      if (!mainWindow) return resolve({ success: false, error: 'No main window reference' });

      // Enforce valid marginType and explicit pageSize to avoid 'page size is empty' driver errors on HP/Epson/PVC printers
      const requestedMargin = options?.marginType;
      const marginType = (requestedMargin && requestedMargin !== 'printableArea') ? requestedMargin : 'default';
      const pageSize = options?.pageSize || 'A4';

      const printOptions = {
        silent: options?.silent ?? false,
        printBackground: true,
        color: true,
        margins: { marginType: marginType },
        landscape: options?.landscape ?? true,
        pageSize: pageSize,
        copies: options?.copies || 1
      };

      if (options?.deviceName && options.deviceName.trim() !== '') {
        printOptions.deviceName = options.deviceName;
      }

      console.log('Sending PVC Card print job:', printOptions);

      mainWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          console.warn('First print attempt failed:', failureReason, '. Retrying with A4 system dialog...');
          const fallbackOptions = { 
            silent: false,
            printBackground: true,
            color: true,
            margins: { marginType: 'default' },
            landscape: options?.landscape ?? true,
            pageSize: 'A4',
            copies: options?.copies || 1
          };

          mainWindow.webContents.print(fallbackOptions, (s2, f2) => {
            if (!s2) {
              console.error('Fallback print failed:', f2);
              resolve({ success: false, error: f2 || failureReason || 'Print operation failed' });
            } else {
              resolve({ success: true, interactive: true });
            }
          });
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
