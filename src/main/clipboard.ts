import { clipboard, Notification } from 'electron'
import { BrowserWindow } from 'electron/main'

let lastText = ''
let intervalId: NodeJS.Timeout | null = null

function showTrayNotification(title: string, body: string): void {
  const notification = new Notification({ title, body })
  notification.show()
}

function processText(text: string, patthern: string): string {
  const regex = new RegExp(patthern, 'g')
  const match = text.match(regex)
  const url = match ? match[0] : ''

  if (url) {
    return url
  } else {
    return text
  }
}

export function startClipboardWatcher(getIsUsePaused: () => boolean, pattern: string): void {
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
      const processed = processText(text, pattern)

      if (processed !== text) {
        clipboard.writeText(processed)
        lastText = processed
        // 发送通知
        showTrayNotification(
          '剪贴板已更新',
          `原始字符串:\n ${text} \n\n 处理后的字符串:\n ${processed}`
        )
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send('clipboard-updated', {
            original: text,
            processed
          })
        })
      } else {
        lastText = text
      }
    }
  }, 500)
}
