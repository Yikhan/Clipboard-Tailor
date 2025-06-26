import { app, shell, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { startClipboardWatcher } from './clipboard'

// 自定义逻辑功能
let tray: Tray | null = null
let isUserQuitting = false
let isUserPaused = false

function getIsUsePaused(): boolean {
  return isUserPaused
}

function updateWindowTitle(): void {
  const title = isUserPaused ? 'Clipboard Tailor (Paused)' : 'Clipboard Tailor'
  BrowserWindow.getAllWindows().forEach((win) => {
    win.setTitle(title)
  })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 200,
    show: false,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: join(app.getAppPath(), 'resources/icons/icon.ico')
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('close', (event) => {
    if (process.platform !== 'darwin' && !isUserQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 动态生成菜单
function updateTrayMenu(): void {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主界面',
      click: () => {
        const win = BrowserWindow.getAllWindows()[0]
        if (win) win.show()
        else createWindow()
      }
    },
    {
      label: isUserPaused ? '恢复捕获' : '暂停捕获',
      click: () => {
        isUserPaused = !isUserPaused
        updateTrayMenu()
        updateWindowTitle()
      }
    },
    {
      label: '退出',
      click: () => {
        isUserQuitting = true
        app.quit()
      }
    }
  ])
  tray?.setContextMenu(contextMenu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // 设置系统托盘图标
  // 注意：在 macOS 上，托盘图标会显示在菜单栏中
  // 在 Windows 和 Linux 上，托盘图标会显示在任务栏的系统托盘区域
  tray = new Tray(join(app.getAppPath(), 'resources/icons/icon.ico'))
  tray.setToolTip('Clipboard Tailor')
  tray.on('click', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      win.show()
      win.focus()
    }
  })
  // 创建 or 更新托盘菜单
  updateTrayMenu()
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('update-pattern', (_, pattern) => {
    // 启动剪贴板监听器
    startClipboardWatcher(getIsUsePaused, pattern)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
