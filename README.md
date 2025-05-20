# 图片压缩在线工具（全栈版）

> 轻量、高效、安全的图片压缩在线工具，支持 JPEG/PNG/WebP/AVIF 主流格式，前后端分离，支持本地与云端（Render）一键部署。

---

## 项目简介

本项目为现代化图片压缩在线工具，包含前端（React + Vite + Tailwind CSS）和后端（NestJS + Sharp）。支持多图上传、智能/自定义压缩、体积对比、批量处理、云端直传等功能，UI 参考苹果风格，适配手机/PC。

---

## 核心功能

- 支持 PNG、JPEG、WebP、AVIF 格式图片上传与压缩
- 智能压缩（自动优化）与自定义压缩（质量/分辨率/尺寸调节）
- 批量上传（≤50张/次）、每张图片独立压缩与下载
- 显示压缩前后体积、进度条、压缩质量可调
- 前端本地压缩与后端精准压缩（Sharp 二分法逼近目标体积）
- 响应式自适应布局，苹果风格现代 UI
- 支持 Render 云端一键部署

---

## 技术栈

### 前端
- React 18 + TypeScript 5
- Vite 4
- Tailwind CSS 3 + Headless UI
- browser-image-compression

### 后端
- Node.js 20（LTS）
- NestJS 10
- Sharp 0.32（基于 libvips）
- 支持 MinIO/阿里云OSS（可选扩展）

---

## 目录结构

```
├── image-compressor/   # 前端源码
│   ├── src/
│   ├── public/
│   └── ...
├── server/             # 后端源码
│   ├── src/
│   └── ...
└── README.md           # 项目总览说明
```

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
```

### 2. 本地启动

#### 后端（NestJS）
```bash
cd server
npm install
npm run start:dev
# 默认监听 3000 端口
```

#### 前端（React/Vite）
```bash
cd image-compressor
npm install
npm run dev
# 默认监听 3001 端口
```

访问前端：[http://localhost:3001](http://localhost:3001)
部署在Render的前端：https://image-compressor-g7dx.onrender.com

---

## 环境变量说明

### 前端
- `VITE_API_BASE_URL`：后端 API 地址
  - 本地开发：`.env.development` 设为 `http://localhost:3000`
  - 生产部署：`.env.production` 设为 Render 后端地址，如：
    ```env
    VITE_API_BASE_URL=https://image-compressor-server-7nt2.onrender.com
    ```

### 后端
- 支持通过 `.env` 配置端口、云存储等参数（可选）
- 必须监听 `process.env.PORT`（Render 部署要求）

---

## Render 云端一键部署

### 前端
1. 登录 [https://render.com/](https://render.com/)，新建 Static Site，选择本项目仓库
2. Root Directory 设为 `image-compressor`
3. Build Command：`npm run build`  Publish Directory：`dist`
4. 添加环境变量 `VITE_API_BASE_URL`，指向你的后端服务地址

### 后端
1. 新建 Web Service，Root Directory 设为 `server`
2. Build Command：`npm install`
3. Start Command：`npm run start:prod` 或 `node dist/main.js`
4. 端口监听 `process.env.PORT`

---

## 相关链接

- [前端 README 详情](./image-compressor/README.md)
- [Render 官网](https://render.com/)
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)
- [Sharp](https://sharp.pixelplumbing.com/)

---

## License

MIT 
