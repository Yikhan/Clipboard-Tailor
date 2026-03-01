<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { Input as VarInputType } from '@varlet/ui'

const defaultRegex = /pan.baidu.com\/s\/[^\s]+/
const inputRegex = ref(defaultRegex.toString())
const activeRegex = ref(defaultRegex)
const inputRegexRef = ref<VarInputType | null>(null)
const clipboardResult = reactive({
  original: '',
  processed: ''
})
let errorMessage = ref('')

const notifySystem = (body: string, title = 'Clipboard Tailor'): void => {
  window.electron.ipcRenderer.send('show-notification', title, body)
}

const writeProcessedToClipboard = (text: string): void => {
  try {
    window.electron.ipcRenderer.send('write-clipboard', text)
    notifySystem('已将处理结果写入剪贴板: ' + text)
  } catch (e) {
    console.info('Clipboard write failed:', e)
    notifySystem('写入剪贴板失败')
  }
}

const parseRegex = (pattern: string): RegExp => {
  try {
    errorMessage.value = ''
    const newRegex = new RegExp(pattern)
    return newRegex
  } catch (e) {
    console.info('Invalid regex pattern:', e)
    errorMessage.value = `Invalid Regex: ${e instanceof Error ? e.message : String(e)}`
    notifySystem(errorMessage.value)
    // 返回上一次有效的正则表达式
    return activeRegex.value
  } finally {
    inputRegexRef.value?.validate()
  }
}
const onResetRegex = (): void => {
  inputRegex.value = defaultRegex.toString()
  onApplyRegex()
}

const onApplyRegex = (): void => {
  const newRegex = parseRegex(inputRegex.value)
  activeRegex.value = newRegex

  if (clipboardResult.original) {
    const match = clipboardResult.original.match(newRegex)
    const processed = match ? match[0] : clipboardResult.original
    clipboardResult.processed = processed

    if (processed !== clipboardResult.original) {
      writeProcessedToClipboard(processed)
    }
  }
}

onMounted(() => {
  window.electron.ipcRenderer.on('clipboard-updated', (_event, text: string) => {
    console.log('Clipboard updated:', text)
    clipboardResult.original = text

    const match = text.match(activeRegex.value)
    const processed = match ? match[0] : text
    clipboardResult.processed = processed

    if (processed !== text) {
      writeProcessedToClipboard(processed)
    }
  })
})
</script>

<template>
  <var-space direction="column" size="large" class="content" align="center">
    <var-space align="baseline">
      <var-input
        ref="inputRegexRef"
        v-model="inputRegex"
        placeholder="请输入正则表达式"
        :rules="() => errorMessage === '' || errorMessage"
      />
      <var-button size="small" class="button-action" type="primary" @click="onApplyRegex">
        应用
      </var-button>
      <var-button size="small" class="button-reset" type="primary" @click="onResetRegex">
        重置
      </var-button>
    </var-space>

    <div class="active-regex-container">
      <label class="active-regex-label">当前使用的正则</label>
      <p class="active-regex">{{ activeRegex.toString() }}</p>
    </div>
  </var-space>
</template>

<style scoped>
.content {
  width: 100%;
}

.button-action,
.button-reset {
  align-self: center;
}

.active-regex-label {
  font-weight: 200;
  font-size: 0.8rem;
}

.active-regex {
  text-align: center;
  max-width: 320px;
  overflow: auto;
  margin-block-start: 0rem;
}
</style>
