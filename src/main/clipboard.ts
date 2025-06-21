import { clipboard } from 'electron'
import { BrowserWindow } from 'electron/main'

let lastText = ''

function processText(text: string): string {
  // ����д����ַ���������򣬱���ȥ���ո�
  const match = text.match(/https:\/\/[^\s]+/)
  const url = match ? match[0] : ''

  if (url) {
    // ���ƥ�䵽 URL���򷵻� URL
    return url
  } else {
    // ���û��ƥ�䵽 URL���򷵻�ԭ�ı�
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
        // ֪ͨ��Ⱦ����
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send('clipboard-updated', processed)
        })
      } else {
        lastText = text
      }
    }
  }, 500)
}
