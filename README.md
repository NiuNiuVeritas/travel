# trip-2026

2026 夏季新加坡 · 文莱 · 沙巴行程页。

## 本地预览

```bash
python -m http.server 5173
# 或者
npx serve .
```

打开 `http://localhost:5173`。

## 部署 Vercel

把整个 `trip-2026` 文件夹拖到 [vercel.com/new](https://vercel.com/new)，无构建命令，直接出链接。

## 文件

```
trip-2026/
├── index.html
├── styles/main.css
├── scripts/main.js
└── README.md
```

## 想改什么

- **出发日期 / 倒计时**：`scripts/main.js` 顶部 `target`。
- **配色**：`styles/main.css` 里 `:root` 的色板。
- **章节顺序 / 文字**：直接改 `index.html` 对应 `<section class="page">`。
- **图片**：每个城市 section 里 `<figure class="hero-photo" style="--ph: url(...)">`。换 URL 即可；加载失败会自动降级为暖色块。

## 已知

- 当前图片走 Unsplash 直链，少数可能因为 ID 失效返回 404，JS 会自动隐藏。需要稳定就换成自己上传的图，放进项目目录里。
- 公开可访问，没加密码。需要的话用 Vercel password protection（付费）或前端简单门即可。
