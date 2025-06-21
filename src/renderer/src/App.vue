<script setup lang="ts">
import { onMounted, ref, watch, reactive } from 'vue'
import { Input as VarInputType } from '@varlet/ui'

const defaultRegex = /https:pan.baidu\/\/[^\s]+/
const inputRegex = ref(defaultRegex.toString())
const activeRegex = ref(defaultRegex)
const inputRegexRef = ref<VarInputType | null>(null)
const clipboardResult = reactive({
  original: '',
  processed: ''
})
let errorMessage = ref('')

const sendRegex = (pattern: RegExp): void => {
  window.electron.ipcRenderer.send('update-pattern', pattern)
}
const parseRegex = (pattern: string): RegExp => {
  try {
    const newRegex = new RegExp(pattern)
    errorMessage.value = ''
    return newRegex
  } catch (e) {
    console.info('Invalid regex pattern:', e)
    errorMessage.value = `Invalid Regex`
    // 返回上一次有效的正则表达式
    return activeRegex.value
  } finally {
    inputRegexRef.value?.validate()
  }
}
const onResetRegex = (): void => {
  inputRegex.value = defaultRegex.toString()
}

watch(inputRegex, (newValue) => {
  console.log('Regex input changed:', newValue)
  const newRegex = parseRegex(newValue)
  activeRegex.value = newRegex
  sendRegex(parseRegex(newValue))
})

onMounted(() => {
  window.electron.ipcRenderer.on('clipboard-updated', (_event, result) => {
    console.log('Clipboard updated:', result)

    clipboardResult.original = result.original
    clipboardResult.processed = result.processed
  })

  sendRegex(defaultRegex)
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
