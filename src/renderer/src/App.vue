<script setup lang="ts">
import { onMounted, ref } from 'vue'

const stringPattern = ref(/https:\/\/[^\s]+/)

const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

onMounted(() => {
  window.electron.ipcRenderer.on('clipboard-updated', (_event, text) => {})
})
</script>

<template>
  <div class="main">
    <var-space direction="column" size="large" class="content">
      <var-input v-model="stringPattern" placeholder="请输入正则" />
    </var-space>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: 1rem;
}

.content {
  width: 100%;
  max-width: 300px;
}
</style>
