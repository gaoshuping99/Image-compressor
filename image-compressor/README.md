# 图片压缩在线工具（前端）

> 现代化、苹果风格的图片压缩在线工具，支持 JPEG/PNG/WebP 主流格式，批量上传与压缩，前后端分离，支持本地与云端部署。

---

## 项目简介

本项目为图片压缩在线工具的前端部分，基于 React + TypeScript + Vite + Tailwind CSS 构建，UI 参考苹果风格，支持多图上传、压缩、预览、下载，压缩前后体积对比。支持前端本地压缩与后端精准压缩（对接 NestJS + Sharp 后端）。

---

## 核心功能

- 支持 PNG、JPEG、WebP 格式图片上传与压缩
- 批量上传（多张图片）、每张图片独立压缩与下载
- 前端压缩（browser-image-compression）与后端精准压缩（Sharp）双模式
- 显示压缩前后体积、进度条、压缩质量可调
- 响应式自适应布局，苹果风格现代 UI

---

## 技术栈

- **前端框架**：React 18 + TypeScript 5
- **构建工具**：Vite 4
- **UI 组件**：Tailwind CSS 3 + Headless UI
- **图片压缩**：browser-image-compression（前端）
- **状态管理**：useState（轻量）
- **网络请求**：fetch API

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名/image-compressor
```

### 2. 安装依赖

```bash
npm install
# 或 yarn install
```

### 3. 本地开发

```bash
npm run dev
# 或 yarn dev
```

访问： [http://localhost:3001](http://localhost:3001)

### 4. 生产构建

```bash
npm run build
# 或 yarn build
```

---

## 环境变量说明

- **VITE_API_BASE_URL**：后端 API 地址
  - 本地开发建议在 `.env.development` 设置为 `http://localhost:3000`
  - 生产部署时在 `.env.production` 设置为 Render/NestJS 后端地址，如：
    ```env
    VITE_API_BASE_URL=https://image-compressor-server-7nt2.onrender.com
    ```

---

## Render 云端部署

1. 前端代码推送至 GitHub
2. 登录 [https://render.com/](https://render.com/)，新建 Static Site，选择本项目仓库
3. Root Directory 设为 `image-compressor`
4. Build Command：`npm run build`  Publish Directory：`dist`
5. 在 Render 控制台添加环境变量 `VITE_API_BASE_URL`，指向你的后端服务地址
6. 部署完成后即可通过 Render 分配的域名访问

---

## 相关链接

- [后端仓库（NestJS + Sharp）](../server)
- [Render 官网](https://render.com/)
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)

---

## License

MIT
