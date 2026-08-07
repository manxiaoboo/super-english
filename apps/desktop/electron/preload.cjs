const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('reviewApp', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  chooseProject: () => ipcRenderer.invoke('settings:choose-project'),
  getDueItems: (limit) => ipcRenderer.invoke('review:due', limit),
  evaluate: (payload) => ipcRenderer.invoke('review:evaluate', payload),
  updateReview: (payload) => ipcRenderer.invoke('review:update', payload),
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  setPinned: (pinned) => ipcRenderer.send('window:pin', pinned),
  onNavigate: (callback) => ipcRenderer.on('navigate', (_event, view) => callback(view)),
  onSettingsChanged: (callback) => ipcRenderer.on('settings:changed', (_event, settings) => callback(settings))
})