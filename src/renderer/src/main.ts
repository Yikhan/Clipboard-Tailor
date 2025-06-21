import { createApp } from 'vue'
import App from './App.vue'

// 全局样式
import './main.css'
import { StyleProvider, Themes } from '@varlet/ui'

StyleProvider(Themes.dark)

createApp(App).mount('#app')
