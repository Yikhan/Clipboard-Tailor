# Clipboard Tailor

Clipboard Tailor 是一个基于 Electron + Vue3 + TypeScript 的桌面应用，支持自定义正则表达式处理剪贴板内容，并通过托盘图标和系统通知进行交互。

编写该工具的起因是百度网盘的分享功能会自带一长串的广告字符，每次都要手动清理令人烦不胜烦。

## 功能特性

- 实时监听剪贴板内容
- 支持自定义正则表达式提取内容
- 剪贴板内容变更时自动处理并覆盖
- 托盘图标，支持最小化到托盘
- 系统原生通知提醒
- 跨平台支持（Windows/macOS/Linux）

## 目录结构

```
├─ src
│  ├─ main         # Electron 主进程代码
│  ├─ preload      # 预加载脚本
│  └─ renderer     # 前端 Vue3 代码
├─ resources       # 应用图标等静态资源
├─ assets          # 其他资源
├─ electron-builder.yml
├─ package.json
├─ tsconfig.json
└─ README.md
```

## 安装依赖

```bash
pnpm install
# 或
npm install
```

## 开发调试

```bash
pnpm dev
# 或
npm run dev
```

## 打包构建

```bash
pnpm build
# 或
npm run build
```

## 打包为安装包

```bash
pnpm build:win    # Windows
pnpm build:mac    # macOS
pnpm build:linux  # Linux
```

## 主要依赖

- [Electron](https://www.electronjs.org/)
- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Varlet UI](https://varlet.gitee.io/varlet-ui/#/zh-CN/home)
- [electron-vite](https://github.com/electron-vite/electron-vite)
- [electron-builder](https://www.electron.build/)

## 其他说明

- 图标文件请放在 `resources/icons/` 目录下。
- 正则表达式可在前端界面自定义，自动同步到主进程。
- 支持系统托盘和原生通知。
