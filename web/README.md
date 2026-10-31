# web · Open X Analytics 看板

React 19 + TypeScript + Vite + Tailwind CSS 4 + ECharts 的纯静态看板。

## 开发

在仓库根目录执行（会先从 `data/` 生成 `web/public/data/*.json`）：

```bash
pnpm dev      # 开发服务器 http://localhost:3000
pnpm build    # 生成数据 + 类型检查 + 构建到 web/dist
```

只改前端时可在 `web/` 下直接 `pnpm dev`，前提是 `public/data/` 已经生成过。

## 数据文件

由 `scripts/prepare_web_data.py` 生成，前端不做任何统计口径的计算。

| 文件 | 内容 | 加载时机 |
|---|---|---|
| `summary.json` | 汇总指标、三阶段统计、数据截止日期 | 首屏 |
| `overview.json` | 逐日大盘 | 首屏 |
| `posts.json` | 原创主帖（含全文） | 首屏 |
| `replies.json` | 回复帖 | 勾选「包含回复帖」或直达某条回复时 |

## 目录

```text
src/
├── App.tsx                 页面编排，各区块独立加载
├── components/             UI 组件（图表为懒加载）
├── hooks/
│   ├── useJson.ts          按需加载数据文件
│   └── useECharts.ts       ECharts 实例生命周期（按需注册、自适应、卸载销毁）
├── lib/
│   ├── post.ts             阶段、筛选、排序规则（单一来源）
│   ├── postHash.ts         当前打开的推文 <-> URL hash（#post-<id>）
│   ├── data.ts             数据请求（相对 document.baseURI，兼容子路径部署）
│   └── format.ts           数字格式化与 HTML 转义
└── types/analytics.ts      数据类型
```

## 部署

推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布到 GitHub Pages。
