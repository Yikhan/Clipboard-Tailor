import { clipboard } from 'electron'
import { BrowserWindow } from 'electron/main'

let lastText = ''

function processText(text: string): string {
  // 这里写你的字符串处理规则，比如去除空格
  const match = text.match(/https:\/\/[^\s]+/)
  const url = match ? match[0] : ''

  if (url) {
    // 如果匹配到 URL，则返回 URL
    return url
  } else {
    // 如果没有匹配到 URL，则返回原文本
    return text
  }
}

export function startClipboardWatcher(): void {
  setInterval(() => {
    const text = clipboard.readText()
    if (text && text !== lastText) {
      const processed = processText(text)

      if (processed !== text) {
        clipboard.writeText(processed)
        lastText = processed
        // 通知渲染进程
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send('clipboard-updated', processed)
        })
      } else {
        lastText = text
      }
    }
  }, 500)
}
