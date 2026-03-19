# BlurEditor

<!-- 演示图片占位符 - 请在此处放置 GLTF 演示图片 -->
<div align="center">
  <img src="./demo-preview.png" alt="BlurEditor 演示" width="800" />
  <p><em>一款专注于沉浸式写作体验的 Markdown 编辑器</em></p>
</div>

---

## 📋 目录

- [简介](#-简介)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [使用指南](#-使用指南)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
- [快捷键](#-快捷键)
- [浏览器兼容性](#-浏览器兼容性)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🎯 简介

**BlurEditor** 是一款专为追求极致写作体验而设计的 Markdown 编辑器。采用现代化的科技风格 UI 设计，结合独特的"模糊聚焦"交互模式，帮助用户在写作时保持专注，减少干扰。

### 核心设计理念

- **沉浸式体验**: 通过背景模糊效果，让用户专注于当前编辑区域
- **实时预览**: 支持分屏预览模式，所见即所得
- **数据持久化**: 自动保存到本地存储，永不丢失
- **历史管理**: 智能记录编辑历史，支持版本回溯
- **收藏功能**: 快速收藏重要内容，便于后续查阅

---

## ✨ 功能特性

### 📝 编辑功能

| 功能 | 描述 | 状态 |
|------|------|------|
| Markdown 支持 | 完整的 Markdown 语法支持，包括标题、列表、代码块、引用等 | ✅ |
| 实时预览 | 分屏预览模式，编辑与预览同步 | ✅ |
| 全屏预览 | 沉浸式阅读模式，隐藏编辑界面 | ✅ |
| 分屏调整 | 可拖动分隔线调整编辑区与预览区比例 | ✅ |
| 自动保存 | 内容自动保存到浏览器本地存储 | ✅ |
| 字符统计 | 实时显示字符数、单词数、行数 | ✅ |
| 光标位置 | 显示当前行号和列号 | ✅ |

### 🎨 界面特性

| 特性 | 描述 |
|------|------|
| 科技风格 UI | 采用深色主题配合霓虹渐变效果 |
| 动态背景 | 网格背景 + 粒子动画 + 鼠标光晕效果 |
| 毛玻璃效果 | 面板和按钮采用 backdrop-filter 模糊效果 |
| 响应式设计 | 适配桌面端和移动端 |
| 动画过渡 | 平滑的状态切换动画 |

### 💾 数据管理

| 功能 | 描述 |
|------|------|
| 历史记录 | 自动保存最近 50 条编辑记录 |
| 收藏夹 | 支持收藏重要内容，Ctrl+D 快速收藏 |
| 本地存储 | 所有数据保存在浏览器 localStorage |
| 历史预览 | 支持查看和恢复历史版本 |
| 一键复制 | 快速复制历史或收藏内容 |

---

## 🛠 技术栈

### 前端框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Composition API** - 更灵活的组件逻辑组织方式

### 构建工具
- **Vite** - 下一代前端构建工具，极速冷启动

### 样式方案
- **Tailwind CSS** - 实用优先的 CSS 框架
- **自定义 CSS** - 科技风格主题定制

### 核心依赖
| 依赖 | 版本 | 用途 |
|------|------|------|
| vue | ^3.4.21 | 前端框架 |
| marked | ^15.0.7 | Markdown 解析 |
| vite | ^5.2.0 | 构建工具 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/blureditor.git
   cd blureditor
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   访问 http://localhost:3000 查看应用

4. **构建生产版本**
   ```bash
   npm run build
   ```

---

## 📖 使用指南

### 基础编辑

1. **开始写作**: 点击编辑区域即可开始输入
2. **Markdown 语法**: 支持标准 Markdown 语法
   ```markdown
   # 一级标题
   ## 二级标题
   **粗体文字**
   *斜体文字*
   - 列表项
   `行内代码`
   ```代码块```
   > 引用文本
   ```

### 预览模式

- **进入预览**: 点击底部状态栏的"预览"按钮
- **分屏调整**: 拖动中间的分隔线调整比例
- **全屏预览**: 点击预览区的"全屏"按钮
- **退出预览**: 点击"退出"按钮或再次点击"编辑"

### 历史与收藏

- **查看历史**: 点击底部"历史"按钮或按 `Alt+H`
- **收藏内容**: 按 `Ctrl+D` 收藏当前内容
- **恢复版本**: 在历史面板中点击记录查看详情，然后点击"应用"
- **删除记录**: 点击记录卡片上的删除图标

### 专注模式

- 点击编辑区域外任意位置，编辑区会进入模糊状态
- 再次点击编辑区域即可恢复清晰
- 双击 `ESC` 键可快速退出编辑模式

---

## 📁 项目结构

```
blureditor/
├── public/
│   ├── bg.png              # 背景图片
│   └── favicon.svg         # 网站图标
├── src/
│   ├── components/         # Vue 组件
│   │   ├── BackgroundEffects.vue   # 背景效果（网格、粒子、光晕）
│   │   ├── Editor.vue              # 编辑器组件
│   │   ├── HistoryPanel.vue        # 历史/收藏面板
│   │   ├── StatusBar.vue           # 底部状态栏
│   │   └── Toasts.vue              # 通知提示
│   ├── composables/        # 可复用逻辑
│   │   ├── useEditor.js    # 编辑器状态管理
│   │   ├── useMouseEffects.js      # 鼠标效果
│   │   ├── usePanel.js     # 面板状态管理
│   │   ├── useStorage.js   # 本地存储操作
│   │   └── useToast.js     # Toast 通知
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── style.css               # 全局样式
├── tailwind.config.js      # Tailwind 配置
└── README.md               # 项目文档
```

---

## 💻 开发指南

### 开发规范

- 使用 Vue 3 Composition API
- 组件命名使用 PascalCase
- 可复用逻辑提取到 composables
- 样式使用 Tailwind CSS + 自定义 CSS

### 添加新功能

1. 在 `src/composables/` 创建逻辑文件
2. 在 `src/components/` 创建组件文件
3. 在 `App.vue` 中整合使用
4. 更新 README 文档

### 样式定制

主要样式变量在 `style.css` 中定义：

```css
/* 主题色 */
--color-primary: #38bdf8;      /* 青色 */
--color-secondary: #a855f7;    /* 紫色 */
--color-accent: #f472b6;       /* 粉色 */

/* 背景色 */
--bg-dark: #0f172a;
--bg-panel: rgba(15, 23, 42, 0.7);
```

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Alt + H` | 打开历史记录面板 |
| `Ctrl + D` | 收藏当前内容 |
| `Ctrl + S` | 手动保存到历史 |
| `ESC` (双击) | 退出编辑模式 |
| `I` (模糊时) | 进入编辑模式 |

---

## 🌐 浏览器兼容性

| 浏览器 | 版本 | 支持状态 |
|--------|------|----------|
| Chrome | >= 90 | ✅ 完全支持 |
| Firefox | >= 88 | ✅ 完全支持 |
| Safari | >= 14 | ✅ 完全支持 |
| Edge | >= 90 | ✅ 完全支持 |

> 注：由于使用了 `backdrop-filter` 和 CSS 容器查询，旧版浏览器可能显示效果略有差异。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交规范

- **Bug 修复**: `fix: 修复描述`
- **新功能**: `feat: 功能描述`
- **文档更新**: `docs: 文档描述`
- **样式调整**: `style: 样式描述`
- **代码重构**: `refactor: 重构描述`

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

```
MIT License

Copyright (c) 2024 BlurEditor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端工具链
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Marked](https://marked.js.org/) - Markdown 解析器

---

<div align="center">
  <p>Made with ❤️ by BlurEditor Team</p>
  <p>
    <a href="https://github.com/yourusername/blureditor">GitHub</a> •
    <a href="https://blureditor-demo.vercel.app">在线演示</a> •
    <a href="https://github.com/yourusername/blureditor/issues">问题反馈</a>
  </p>
</div>
