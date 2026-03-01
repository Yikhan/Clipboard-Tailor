import { clipboard } from 'electron'
import { BrowserWindow } from 'electron/main'

let lastText = ''
let intervalId: NodeJS.Timeout | null = null

export function startClipboardWatcher(getIsUsePaused: () => boolean): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }

  intervalId = setInterval(() => {
    // 如果用户暂停了功能，则不处理剪贴板
    if (getIsUsePaused()) {
      return
    }
    // 检查剪贴板中的文本
    const text = clipboard.readText()
    if (text && text !== lastText) {
      lastText = text
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('clipboard-updated', text)
      })
    }
  }, 500)
}
