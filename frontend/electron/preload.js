const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Printer Management
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printCard: (options) => ipcRenderer.invoke('print-card', options),

  // Native File Dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  saveFileContent: (filepath, content) => ipcRenderer.invoke('save-file-content', { filepath, content }),
  readFileContent: (filepath) => ipcRenderer.invoke('read-file-content', filepath),

  // Platform info
  isElectron: true,
  platform: process.platform
});
