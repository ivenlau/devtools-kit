# DevToolsKit - 程序员在线开发工具箱

> 一个功能全面的程序员在线开发工具箱，包含20+实用工具，无需安装，打开浏览器即用。

## 📋 项目概览

本项目提供日常开发中高频使用的实用工具集合，包括：
- 📝 **文本处理**: JSON 格式化、Markdown 编辑器、Diff 文本对比
- 🔄 **编解码**: Base64、URL、HTML 实体
- ⏰ **时间日期**: Unix 时间戳转换
- 🔐 **加密安全**: 哈希生成 (MD5/SHA)、UUID 生成、JWT 解码
- 🎨 **前端开发**: 颜色转换、正则测试、代码压缩 (Minify)
- 🌐 **网络工具**: IP 查询、User-Agent 解析、cURL 命令生成
- 📦 **格式转换**: JSON/YAML/XML/TOML 互转、进制转换
- 🖼️ **图像工具**: 图片压缩、二维码生成
- ⚙️ **其他**: Cron 表达式生成、SQL 格式化

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm / yarn / pnpm

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/ivenlau/devtools-kit.git
cd devtools-kit

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问
# http://localhost:3000
```

## 🛠️ 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **图标**: Lucide React
- **部署**: Static Export (支持 GitHub Pages / Docker)

## 🚢 部署

本项目支持多种部署方式，推荐使用静态导出部署。

### 1. GitHub Pages (推荐)

本项目已配置 GitHub Actions 自动部署。

1. Fork 本仓库。
2. 在仓库设置 (Settings) -> Pages 中，Source 选择 **GitHub Actions**。
3. 每次推送到 `main` 分支，会自动构建并部署到 GitHub Pages。

### 2. Docker 部署

项目包含 `Dockerfile` 和 `docker-compose.yml`，基于 Nginx 托管静态文件。

```bash
# 使用 Docker Compose 启动
docker-compose up -d --build

# 访问 http://localhost:3000
```

### 3. 静态文件部署 (Nginx/Vercel/Netlify)

```bash
# 构建静态文件
npm run build

# 构建产物位于 out/ 目录
# 可以直接将 out 目录上传到任何静态文件服务器
```

## 📚 包含工具列表

| 分类 | 工具名称 | 描述 |
| --- | --- | --- |
| **文本** | JSON 格式化 | 格式化、压缩、验证 JSON |
| | Markdown | 实时预览 Markdown 编辑器 |
| | Diff 对比 | 文本差异对比工具 |
| **编解码** | Base64 | Base64 编码与解码 |
| | URL 编解码 | URL 编码/解码与解析 |
| | HTML 实体 | HTML 特殊字符转义 |
| **开发** | 正则测试 | 正则表达式实时测试 |
| | Cron 表达式 | Cron 任务表达式生成与解析 |
| | SQL 格式化 | SQL 语句美化 |
| | 代码压缩 | HTML/CSS/JS 代码压缩 |
| **转换** | 时间戳转换 | Unix 时间戳与日期互转 |
| | 颜色转换 | HEX/RGB/HSL 互转 |
| | 进制转换 | 二进制/十进制/十六进制互转 |
| | 数据转换 | JSON/YAML/XML/TOML 互转 |
| **网络** | IP 查询 | IP 地址与地理位置查询 |
| | cURL 生成 | 可视化构建 cURL 命令 |
| | UA 解析 | User-Agent 解析 |
| **安全** | 哈希/UUID | MD5/SHA 哈希与 UUID 生成 |
| | JWT 解码 | JWT Token 解析与调试 |
| **图像** | 图片压缩 | 在线图片压缩 |
| | 二码生成 | 自定义二维码生成 |

## 🤝 贡献指南

欢迎贡献代码、报告bug或提出新功能建议！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件
