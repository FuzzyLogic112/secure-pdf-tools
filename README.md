
# 🛡️ SecurePDF Ultimate - 隐私优先的商业级文档工具

<div align="center">

![Version](https://img.shields.io/badge/version-3.0.0-blue?style=flat-square&logo=git)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-success?style=flat-square&logo=adguard)
![Engine](https://img.shields.io/badge/Engine-WebAssembly-orange?style=flat-square&logo=webassembly)
![Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)

** 100% 浏览器端运行、支持智能排版还原的开源 PDF 工具箱**

[在线演示 (Live Demo)](https://fuzzylogic112.github.io/secure-pdf-tools/) · [报告 Bug](https://github.com/FuzzyLogic112/secure-pdf-tools/issues) · [请求功能](https://github.com/FuzzyLogic112/secure-pdf-tools/issues)

</div>

---

## 📖 项目简介 (Introduction)

**SecurePDF Ultimate** 是一个突破性的纯前端 SaaS 解决方案。针对传统 PDF 工具（如 SmallPDF）必须上传文件带来的隐私泄露风险，本项目利用 **WebAssembly** 和 **Modern Web APIs**，实现了所有转换逻辑在用户浏览器内存中闭环运行。

**v3.0 版本重大更新：** 引入了全新的「智能排版重组算法」，在 PDF 转 Word 时不再是简单的提取文字，而是能够识别字号大小、加粗样式，并智能合并段落，提供接近原生文档的编辑体验。

### 核心价值
* 🔒 **零信任架构**：没有后端，没有数据库，文件绝不离开您的设备。
* ⚡ **毫秒级响应**：本地运算，无需排队，无网络延迟。
* 🧠 **智能还原**：独创的前端算法，尽可能保留原文档的段落和格式。
* 💸 **零成本部署**：基于 GitHub Pages 托管，无需购买服务器。

---

## 📸 界面预览 (Screenshots)

<div align="center">
  <img width="1256" height="732" alt="image" src="https://github.com/user-attachments/assets/35315058-99cc-4b27-8545-28c3ffc119c8" />

  <br>
  <em>简洁专业的 UI 设计，支持拖拽上传与实时进度反馈</em>
</div>

---

## 🚀 功能特性 (Features)

| 功能模块 | 核心技术 | 亮点说明 |
| :--- | :--- | :--- |
| **📄 PDF 转 Word** | `PDF.js` + `docx.js` | **v3.0 新特性**：支持字号识别、段落智能重组、粗体还原。不再是乱码般的纯文本。 |
| **📑 Word 转 PDF** | `mammoth.js` + `html2pdf` | **行业难点突破**：在无后端环境下，通过离线渲染引擎实现 docx 到 pdf 的转换。 |
| **🖼️ PDF 转 图片** | `Canvas Rendering` | 高清渲染，支持批量导出，自动打包为 ZIP 下载。 |
| **📚 图片 转 PDF** | `jsPDF` | 智能适配 A4 纸张，支持拖拽排序，快速合并扫描件。 |

---

## 🛠️ 技术栈 (Tech Stack)

本项目采用现代化的 **HTML5 + ES6 + CSS3** 分离架构：

* **UI 框架**: [Tailwind CSS](https://tailwindcss.com/) (CDN 引入，无需构建)
* **PDF 解析**: [Mozilla PDF.js](https://mozilla.github.io/pdf.js/)
* **文档生成**: [docx](https://docx.js.org/) & [jsPDF](https://github.com/parallax/jsPDF)
* **Word 解析**: [Mammoth.js](https://github.com/mwilliamson/mammoth.js)
* **渲染引擎**: [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)
* **打包工具**: [JSZip](https://stuk.github.io/jszip/)

---

## 📂 项目结构 (Structure)

代码已解耦为标准的 Web 开发结构，便于维护：

```text
secure-pdf-tools/
├── index.html        # 核心入口 & DOM 结构
├── style.css         # 自定义样式 & 打印渲染样式
├── script.js         # 核心业务逻辑 (转换算法)
├── assets/           # 静态资源
├── README.md         # 项目文档
└── LICENSE           # MIT 许可证

```

---

## ⚡ 快速部署 (Deployment)

本项目是纯静态的，您可以在 30 秒内完成部署：

### 方法一：GitHub Pages (推荐)

1. **Fork** 本仓库。
2. 进入仓库 **Settings** -> **Pages**。
3. 在 **Source** 下选择 `Deploy from a branch`，分支选择 `main` (或 master)。
4. 点击 Save，等待 1 分钟即可访问。

### 方法二：本地运行

1. 克隆仓库：
```bash
git clone [https://github.com/FuzzyLogic112/secure-pdf-tools]

```


2. 直接双击打开 `index.html` 即可使用。
*注：建议使用 VS Code 的 Live Server 插件运行，以避免本地文件协议 (file://) 的 CORS 限制。*

---

## ⚠️ 隐私合规声明 (Privacy Policy)

**GDPR / CCPA / PIPL 合规性说明：**

本应用严格遵守「数据最小化」原则：

1. **不收集数据**：我们不使用 Cookie 跟踪您的行为，也不收集任何个人信息。
2. **不传输文件**：所有转换逻辑均在 WebWorker 线程中执行，网络请求仅用于下载静态 JS 库。
3. **无第三方访问**：除了基础的 CDN 资源加载，不存在任何数据回传接口。

---

## 🤝 贡献指南 (Contributing)

欢迎提交 PR 帮助改进算法！目前的优化方向：

* [ ] 增加 Excel (.xlsx) 转 PDF 功能
* [ ] 优化复杂表格在 Word 中的还原度
* [ ] 增加暗黑模式 (Dark Mode)

---

## 📄 许可证 (License)

本项目基于 MIT 许可证开源。您可以免费用于商业用途，但请保留版权声明。
