import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, safeStorage, screen, Tray } from 'electron'
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)
let mainWindow
let tray
let quitting = false
let copilotClient
let copilotToken
let reminderTimer
const launchHidden = process.argv.includes('--hidden')
const trayIconPng = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIKSURBVFhH1ZexbsIwEIYZOzJ27CN0aWN3gUfoWBVbqcTSsWMXJMZuHZF4gYqJDcaOGVmqJkxZQGVA6sBQMbk6J0HJnRPihFTqL30LPny/z/YZWq3/qs/eNfN7TjcNjjmpPtyrc1+yx6Xk86XkqgAvkPzZd50LPEclhW6nvZR8GAj2Y0hWjOAjMI7nLC0oayDYN5nYAm1c8Ds891H5wnmotOp8hjhHriC5YYL6CP6KcxHFZT/lyjPAQcY5D4IDU3fPj6EXd39ziXNrQYnwF8y8qJ0yyVNrEmuCTXHuZPXHSz/2cNaUyhrgilQBmgcJImRXvhunx/pqu7EwIPgoYwA6GAnCDCZqn2TfTFSIx20Q/OuQPO52NAiTNkAqUIFkG+BhIYM5rBcpB3WNJB0yEPyWDOYCe40tgFZqO8CxxQSSPWkD8StHAooxXUWLQxgRtWcohWGwJFkj+1nfEGMGbl5UgZ7TxYM2hLNVJQPw5mgD0ITwoBG4BeT6FfWGYuDwxxdRb0OIAwjoGhIRc/lA1w3dzlnaQIl3IO8G2K08Ar0H0BRoUHPA1c8Y0CYkm+LAJggkW+DcWn9VBePqE5V7FWuAX0GTAsneyBdPg5c5+XmCoAZMQPI2zlUo6NWGiewRfFRq5SbFbfqdTFoGwfzCA2cjmAi2pdTvRsnnhz7fhPR/h+i2wBYdgM9tS/0LVpdY5xJtZaUAAAAASUVORK5CYII='

const defaults = {
  projectPath: path.resolve(app.getAppPath(), '..', '..'),
  model: 'gpt-5-mini',
  reminderMinutes: 45,
  launchAtLogin: true,
  alwaysOnTop: true,
  opacity: 0.94,
  token: ''
}

const settingsFile = () => path.join(app.getPath('userData'), 'settings.json')

function readSettings() {
  try {
    const saved = JSON.parse(readFileSync(settingsFile(), 'utf8'))
    const token = saved.encryptedToken && safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(Buffer.from(saved.encryptedToken, 'base64'))
      : ''
    return { ...defaults, ...saved, token, encryptedToken: undefined }
  } catch {
    return { ...defaults }
  }
}

function saveSettings(next) {
  const settings = { ...readSettings(), ...next }
  const stored = { ...settings }
  delete stored.token
  if (settings.token && safeStorage.isEncryptionAvailable()) {
    stored.encryptedToken = safeStorage.encryptString(settings.token).toString('base64')
  }
  mkdirSync(app.getPath('userData'), { recursive: true })
  writeFileSync(settingsFile(), JSON.stringify(stored, null, 2), 'utf8')
  app.setLoginItemSettings({ openAtLogin: settings.launchAtLogin, args: ['--hidden'] })
  mainWindow?.setAlwaysOnTop(settings.alwaysOnTop, settings.alwaysOnTop ? 'screen-saver' : 'normal')
  mainWindow?.setOpacity(settings.opacity)
  scheduleReminder(settings.reminderMinutes)
  return settings
}

function scheduleReminder(minutes) {
  clearInterval(reminderTimer)
  if (!mainWindow || !Number.isFinite(minutes) || minutes <= 0) return
  reminderTimer = setInterval(async () => {
    if (mainWindow.isVisible()) return
    try {
      const due = await runLearningScript('due-items.mjs', ['--format', 'json', '--limit', '1'])
      if (due.count > 0) showWindow()
    } catch {
      // Invalid paths are handled in the settings screen when the user opens the app.
    }
  }, minutes * 60 * 1000)
  reminderTimer.unref()
}

function positionWindow() {
  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const [width] = mainWindow.getSize()
  mainWindow.setPosition(workArea.x + workArea.width - width - 16, workArea.y + 16)
}

function showWindow(view) {
  const settings = readSettings()
  positionWindow()
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.moveTop()
  mainWindow.setAlwaysOnTop(settings.alwaysOnTop, settings.alwaysOnTop ? 'screen-saver' : 'normal')
  mainWindow.focus()
  if (view) mainWindow.webContents.send('navigate', view)
}

function createWindow() {
  const settings = readSettings()
  mainWindow = new BrowserWindow({
    width: 392,
    height: 540,
    minWidth: 360,
    minHeight: 460,
    maxWidth: 520,
    show: !launchHidden,
    frame: false,
    transparent: false,
    backgroundColor: '#faf9f6',
    resizable: true,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'electron', 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  mainWindow.setOpacity(settings.opacity)
  positionWindow()
  mainWindow.webContents.once('did-finish-load', () => {
    if (!launchHidden) showWindow()
  })
  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  }
  if (!launchHidden) setTimeout(() => showWindow(), 2000).unref()
  mainWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })
}

function createTray() {
  const trayIcon = nativeImage.createFromBuffer(Buffer.from(trayIconPng, 'base64')).resize({ width: 16, height: 16 })
  if (trayIcon.isEmpty()) throw new Error('Failed to create the tray icon')
  tray = new Tray(trayIcon)
  tray.setToolTip('Super English Review')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '开始复习', click: () => showWindow() },
    { label: '设置', click: () => showWindow('settings') },
    { type: 'separator' },
    { label: '退出', click: () => { quitting = true; app.quit() } }
  ]))
  tray.on('click', () => mainWindow.isVisible() && mainWindow.isFocused() ? mainWindow.hide() : showWindow())
}

async function runLearningScript(scriptName, args = []) {
  const { projectPath } = readSettings()
  const script = path.join(projectPath, 'scripts', scriptName)
  if (!existsSync(script)) throw new Error('项目路径无效：找不到学习脚本')
  const { stdout } = await execFileAsync(process.execPath, [script, ...args], {
    cwd: projectPath,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    maxBuffer: 2 * 1024 * 1024
  })
  return JSON.parse(stdout)
}

const denyAgentTools = () => ({ kind: 'reject', feedback: 'This review session does not permit tool use.' })

async function evaluateWithCopilot({ item, answer }) {
  const settings = readSettings()
  if (!settings.token) return localEvaluation(item, answer)
  try {
    const { CopilotClient } = await import('@github/copilot-sdk')
    if (!copilotClient || copilotToken !== settings.token) {
      await copilotClient?.stop()
      copilotClient = new CopilotClient({ gitHubToken: settings.token, workingDirectory: settings.projectPath })
      copilotToken = settings.token
      await copilotClient.start()
    }
    const session = await copilotClient.createSession({
      model: settings.model,
      onPermissionRequest: denyAgentTools,
      infiniteSessions: { enabled: false },
      systemMessage: {
        content: 'Act as a concise English review coach. Evaluate only the supplied answer. Return strict JSON with keys: correct (boolean), feedback (Chinese, max 50 Chinese characters), idealAnswer (English or concise answer), suggestedResult (forgot|hard|good|easy). Do not use tools.'
      }
    })
    try {
      const response = await session.sendAndWait({ prompt: JSON.stringify({ item, answer }) }, 45000)
      const content = response?.data?.content ?? ''
      const json = content.match(/\{[\s\S]*\}/)?.[0]
      if (!json) throw new Error('Copilot returned no evaluation')
      return JSON.parse(json)
    } finally {
      await session.disconnect()
    }
  } catch {
    const evaluation = localEvaluation(item, answer)
    return { ...evaluation, feedback: `AI 暂不可用，已使用本地检查。${evaluation.feedback}` }
  }
}

function localEvaluation(item, answer) {
  const normalized = answer.trim().toLowerCase()
  const target = item.id.toLowerCase()
  const correct = Boolean(normalized) && (normalized.includes(target) || target.includes(normalized))
  return {
    correct,
    feedback: correct ? '回忆正确。再大声读一遍，让表达更顺。' : '先看答案，建立线索与表达的直接连接。',
    idealAnswer: item.summary || item.id,
    suggestedResult: correct ? 'good' : 'forgot'
  }
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  saveSettings(readSettings())
})
app.on('before-quit', async () => { quitting = true; await copilotClient?.stop() })
app.on('window-all-closed', () => {})

ipcMain.handle('settings:get', () => readSettings())
ipcMain.handle('settings:save', (_event, settings) => saveSettings(settings))
ipcMain.handle('settings:choose-project', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
  return result.canceled ? null : result.filePaths[0]
})
ipcMain.handle('review:due', (_event, limit = 20) => runLearningScript('due-items.mjs', ['--format', 'json', '--limit', String(limit)]))
ipcMain.handle('review:evaluate', (_event, payload) => evaluateWithCopilot(payload))
ipcMain.handle('review:update', (_event, { item, result, note }) => runLearningScript('update-review.mjs', ['--type', item.type, '--id', item.id, '--result', result, '--note', note || 'Desktop quick review']))
ipcMain.on('window:minimize', () => mainWindow.hide())
ipcMain.on('window:close', () => mainWindow.hide())
ipcMain.on('window:pin', (_event, pinned) => {
  const settings = saveSettings({ alwaysOnTop: pinned })
  mainWindow.webContents.send('settings:changed', settings)
})