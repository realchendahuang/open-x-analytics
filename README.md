# open-x-analytics 📊

> **一个独立开发者 4 个月从 0 到 1 万粉的真实全量开源数据集**  
> 作者：[@realchendahuang](https://x.com/realchendahuang) ｜ 包含历史上全量推文文本与逐日后台运营数据，持续同步更新。

<p align="left">
  <a href="https://realchendahuang.github.io/open-x-analytics/"><img src="https://img.shields.io/badge/Web%20Dashboard-Online%20Interactive-blue?style=for-the-badge&logo=react" alt="Web Dashboard"></a>
  <a href="https://x.com/realchendahuang"><img src="https://img.shields.io/twitter/follow/realchendahuang?style=social&logo=x" alt="Twitter Follow"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="#"><img src="https://img.shields.io/badge/Status-Living%20Dataset-success" alt="Living Dataset"></a>
  <a href="web/"><img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%20%2B%20Tailwind-purple" alt="React 19"></a>
  <a href="examples/stage_and_pitfall_analysis.py"><img src="https://img.shields.io/badge/Analysis-Cohort%20%26%20Pitfall-purple" alt="Cohort Analysis"></a>
  <a href="data/"><img src="https://img.shields.io/badge/Data%20Format-CSV%20%7C%20JSONL-brightgreen" alt="Format"></a>
  <a href="scripts/sync.py"><img src="https://img.shields.io/badge/Sync-Automated%20Pipeline-blue" alt="Sync"></a>
  <a href="examples/quick_start.py"><img src="https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=white" alt="Python"></a>
  <a href="#-欢迎贡献-community--pr"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

> [!NOTE]
> 欢迎关注作者的 X：[@realchendahuang](https://x.com/realchendahuang)  
> 如果你在分析这套数据或探索独立开发时有任何发现与建议，欢迎随时在 X 上交流。

---

## 🌟 为什么要做这个项目？

4 个月前，我还是一个在 X 上籍籍无名的小白。在这 120 天里，我坚持在推特上一线分享自己的真实开发经验、踩坑记录与架构思考，今天正好有了 10,000 个关注。

我想把自己这 4 个月的经历当成一个完完全全透明的案例：**把后台导出的原始数据和历史上发过的所有帖子无保留地全量开源出来，供所有人免费下载、分析、建模与蒸馏。**

市面上很多社媒分享大多只呈现结果截图或经过挑选的片段，而本项目提供的是**一份彻底完整、无删减、支持科学化复现的一手实证数据**：
- 完整包含作者 [@realchendahuang](https://x.com/realchendahuang) 发布的全部 **2,602 篇推文完整文本与互动数据**（1,122 篇主帖 + 1,480 篇回帖互动与深度讨论）；
- **彻底告别官方后台 280 字截断**：长推深度技术复盘（最高达 2,500+ 字）100% 原汁原味完整呈现，保留真实代码块与排版；
- 涵盖 120 天逐日大盘（曝光、点赞、收藏、转化关注数、蓝 V 行为切片，无一天遗漏）；
- 提供 Excel 友好的原生 CSV 与适合开发者直接跑代码的规范 JSONL；
- **项目保持长效维护，后续每个周期会持续增量同步最新后台数据。**

无论你是做**数据科学、自然语言处理（NLP）、大模型微调**，还是想作为**独立开发者研究中文技术内容的真实增长模型**，都可以自由使用这套数据。希望能为大家带来一份真正物超所值的硬核参考。

---

## 📈 数据集基准指标（首发初始快照）

> **说明**：以下为项目立项（2026-10-12 首发版）时的基准数据快照，随着后续周期性增量同步，数据集将持续生长更新。最新的全量数据请直接查阅 `data/` 目录下的实时文件。

| 指标维度 | 官方实测数据 | 说明与洞察 |
|---|---|---|
| **统计周期** | **2026-06-15 ~ 2026-10-12** (120 天) | 覆盖 0 ➔ 10,000 粉丝成长全历程，无遗漏日 |
| **总曝光量 (Impressions)** | **18,667,383** | 4 个月近两千万级曝光 |
| **总点赞 (Likes)** | **57,779** | 扎实的高净值互动基底 |
| **总收藏 (Bookmarks)** | **45,352** | 极高资产粘性（案头手册型） |
| **全盘藏赞比 (BM / Likes)** | **0.848** | 远高于泛娱乐账号（通常 0.1~0.2） |
| **净增关注 (Net Follows)** | **+9,851** | 净增粉，达成 10,000 粉丝里程碑 |
| **取关率 (Unfollow Churn)** | **9.1%** (取关 985 人) | 粉丝留存率高达 90.9% |
| **主页访问量 (Profile Visits)** | **37,336** | — |
| **主页转粉率 (Follow / Visit)** | **29.02%** | **平均每 3.4 个点进主页的人就有 1 个关注** |
| **蓝 V 付费人群曝光占比** | **12.2%** (227.8 万) | 贡献了 26.1% 的点赞与 26.2% 的主页访问 |
| **记录推文总篇数** | **2,602 篇** | **1,122 篇主帖 + 1,480 篇回帖**（无损长文还原，告别官方截断） |

---

## 📂 仓库目录结构

```text
open-x-analytics/
├── data/
│   ├── csv/
│   │   ├── daily_overview.csv          # 120 天逐日大盘（曝光、点赞、收藏、增粉、取关）
│   │   ├── daily_overview_verified.csv # 蓝 V（X Premium）高净值人群专属数据切片
│   │   └── posts_content.csv           # 2,602 篇全量推文正文与互动明细（无损全文版 CSV）
│   └── jsonl/
│       └── posts.jsonl                 # 开发者友好的标准 JSONL 格式（含生命周期分段与归一化计算字段）
├── examples/
│   ├── dashboard.html                  # 🌟 零依赖单文件交互式增长看板（浏览器双击直开，ECharts 深色模式）
│   ├── stage_and_pitfall_analysis.py   # 🔬 粉丝分段穿透对比与硬核踩坑增粉实证复盘脚本
│   └── quick_start.py                  # 极简分析演示（高藏赞比资产帖与转化排行）
├── scripts/
│   ├── sync.py                         # 官方导出增量去重、清洗与自动化合并工具
│   ├── enrich_with_vault.py            # Vault 无损全文回填与未导出推文深度融合工具
│   └── add_cohort_and_window_metrics.py# 粉丝分段推导、观察窗口归一化与采集时间标记工具
├── LICENSE                             # MIT 开源协议
└── README.md
```

---

## 🗄 数据字典与字段说明

### 1. 推文明细表 (`data/csv/posts_content.csv` / `data/jsonl/posts.jsonl`)

`posts_content.csv` 保持与 X 官方原生导出完全一致的列结构，方便 Excel / 传统 BI 导入；`posts.jsonl` 在此基础上注入了**生命周期归一化与分段特征**：

| 字段名 (CSV) | JSONL 键名 | 类型 | 说明 |
|---|---|---|---|
| `Post id` | `post_id` | String | 推文唯一推特 ID（可直接拼接成链接） |
| `Date` | `date` | String | 发布日期（如 `"Mon, Sep 28, 2026"`） |
| `Post text` | `text` | String | 推文无损完整正文（包含代码块、换行与 emoji） |
| `Post Link` | `link` | String | 推文公开 URL |
| — | `is_reply` | Boolean | 是否为回复互动帖（以 `@` 开头） |
| `Impressions` | `impressions` | Integer | 累计阅读量/曝光量 |
| `Likes` | `likes` | Integer | 累计点赞数 |
| `Bookmarks` | `bookmarks` | Integer | 累计书签/收藏数 |
| `New follows` | `new_follows` | Integer | **单篇推文直接带来的新增关注数** |
| `Replies` | `replies` | Integer | 获得的评论回复数 |
| `Reposts` | `reposts` | Integer | 转推/转发数 |
| `Profile visits`| `profile_visits`| Integer | 该推文带来的个人主页访问次数 |
| `URL Clicks` | `url_clicks` | Integer | 推文中外部链接的点击次数 |
| — | `bookmark_like_ratio` | Float | **藏赞比**（Bookmarks / Likes） |
| — | `snapshot_at` | String | **采集快照时间戳**（ISO 8601，如 `2026-10-12T23:59:59+08:00`） |
| — | `post_age_days` | Integer | **观察时间窗口**（发布日至快照日经历的天数） |
| — | `followers_at_post` | Integer | **发帖时粉丝基数**（由逐日大盘净增粉倒推估算） |
| — | `follower_stage` | String | **账号成长阶段**（🌱 破冰期 0~1K / 🚀 增长期 1K~5K / ⚡ 飞轮期 5K~10K） |
| — | `viral_ratio` | Float | **破圈穿透倍率**（Impressions / followers_at_post，剥离粉丝基数红利） |
| — | `daily_impressions` | Float | **日均曝光量**（Impressions / post_age_days，消除时间积累偏差） |
| — | `daily_likes` | Float | **日均点赞量**（Likes / post_age_days） |
| — | `daily_new_follows` | Float | **日均直接转化关注数**（New follows / post_age_days） |
| — | `follow_rate_per_10k` | Float | **万次曝光转化关注数**（New follows / Impressions × 10,000） |

### 2. 每日大盘表 (`data/csv/daily_overview.csv`)

包含每天全账户维度的核心指标：
`Date`, `Impressions`, `Likes`, `Engagements`, `Bookmarks`, `Shares`, `New follows`, `Unfollows`, `Replies`, `Reposts`, `Profile visits`, `Create Post`, `Video views`, `Media views`。

---

## 🔬 科学复盘：生命周期分段与踩坑记录实证

### 1. 为什么必须引入「观察窗口」与「粉丝分段」？

在社媒数据分析中，只按曝光量降序排“爆款”极易产生两大约束性偏差：
1. **时间窗口偏差**：发布了 120 天的老帖积累了数月的长尾流量与持续收藏，而最近发布的优质推文可能只有几小时或几天。因此数据集增加了 `snapshot_at` 采集快照与 `post_age_days`，并输出 `daily_impressions` 等日均速率指标。
2. **受众基数混淆（Confounding Variable）**：当账号处于 9,000 粉丝时，一条普通的随笔动态也能获得数千曝光；但在 0~700 粉丝的破冰阶段，推文需要完全依赖内容本身的穿透力在公域冷启动。

为此，本项目通过 `viral_ratio`（曝光量 / 当时粉丝基数）剥离已有受众红利：

```text
成长阶段              | 推文数   | 平均曝光      | 平均点赞    | 平均穿透倍率      | 平均藏赞比   
--------------------------------------------------------------------------
🌱 破冰期 (0~1K)    | 17 篇   | 10,245     | 45.8     | 13.4 倍 (最高 135x) | 0.467   
🚀 增长期 (1K~5K)   | 477 篇  | 10,709     | 44.1     | 3.3 倍           | 0.451   
⚡ 飞轮期 (5K~10K)  | 2,108 篇| 5,223      | 14.7     | 0.8 倍           | 0.267   
```

> **实证洞察**：破冰期的平均穿透倍率高达 **13.4 倍**！例如 2026 年 6 月 15 日作者在粉丝仅 ~765 人时发布的 Cloudflare 全家桶经验长推，斩获了 103,531 次曝光，穿透倍率高达 **135.3x**。低曝光期的早期帖子蕴含着最纯粹的冷启动价值。

### 2. 真实的「踩坑记录」到底转化了多少关注？

全库通过语义识别定位出 **138 篇深度的技术踩坑、Bug 排查与架构复盘推文**（关键词涵盖：`踩坑`、`避坑`、`排查`、`翻车`、`bug`、`教训`、`复盘`、`死锁`、`重构` 等）：

- **超高藏赞比（案头手册属性）**：泛娱乐帖藏赞比通常只有 0.1~0.2，而深度踩坑复盘推文的平均藏赞比高达 **1.3 ~ 1.7**（即收藏数远超点赞数），被一线工程师当作备查手册反复调阅；
- **最高转化单帖**：2026 年 9 月 28 日关于架构选型与配置避坑的复盘长推，单篇直接带来 **+163 位高质量关注**、3,227 次收藏与 17.5 万曝光。

运行以下脚本即可直接复现这套分析：
```bash
python3 examples/stage_and_pitfall_analysis.py
```

---

## 📊 交互式看板 (Interactive Dashboard)

### 🌐 在线访问
> **在线看板地址**：[https://realchendahuang.github.io/open-x-analytics/](https://realchendahuang.github.io/open-x-analytics/)  
> *(自定义域名镜像：`https://analytics.chendahuang.com/`)*

本项目提供了全新的工业级模块化 React 看板（位于 `web/` 目录），基于 **React 19 + TypeScript + Vite + Tailwind CSS + ECharts + Lucide** 构建：
- **全景数据穿透**：支持按破冰期/增长期/飞轮期切片查看散点图分布，支持一键筛选「高藏赞比资产帖」、「硬核踩坑帖」与「高转化破圈帖」；
- **全量推文检索**：内置实时正文搜索与多维交叉筛选，卡片直连 X 原推链接；
- **逐日大盘趋势**：120 天全历程净增粉、总曝光与收藏走势双轴面积图，支持时间滑块缩放；
- **本地极速预览**：
  ```bash
  pnpm dev     # 启动热重载开发预览
  pnpm build   # 一键数据清洗与生产构建
  ```

此外，项目亦保留了单文件极简原型 `examples/dashboard.html`，无需任何依赖直接双击即可离线打开。

---

## 🚀 极速上手 (Quick Start)

仓库自带零依赖的 Python 示例脚本，克隆后即可直接运行：

```bash
# 1. 克隆仓库
git clone https://github.com/realchendahuang/open-x-analytics.git
cd open-x-analytics

# 2. 运行极简分析演示
python3 examples/quick_start.py
```

### 用 Pandas 进行高阶分析

```python
import pandas as pd

# 读取 JSONL
df = pd.read_json("data/jsonl/posts.jsonl", lines=True)

# 过滤主帖并筛选高藏赞比资产帖 (Likes >= 100)
assets = df[(~df["is_reply"]) & (df["likes"] >= 100)].sort_values(
    by="bookmark_like_ratio", ascending=False
)

print(assets[["date", "bookmark_like_ratio", "bookmarks", "likes", "impressions", "text"]].head(10))
```

---

## 🔄 持续更新机制 (Update Cadence)

作者会按周期从 X 官方后台导出最新分析明细，并通过内置同步脚本增量合并：

```bash
# 自动合并去重并重新生成 JSONL
python3 scripts/sync.py \
  --overview ~/Downloads/account_overview_analytics.csv \
  --verified "~/Downloads/account_overview_analytics (1).csv" \
  --content ~/Downloads/account_analytics_content_*.csv
```

更新记录会以 Git Tag（如 `v2026.10`、`v2026.11`）进行版本归档。

---

## 👨‍💻 关于作者

- 陈大黄：[@realchendahuang](https://x.com/realchendahuang)
- 个人网站：[chendahuang.com](https://chendahuang.com)

---

## 🤝 欢迎贡献 (Community & PR)

非常欢迎社区提交各种二次创作的 Pull Request：
- 📊 **可视化仪表板**：Streamlit、Gradio、ECharts 或 Observable 看板；
- 🔬 **数据挖掘与洞察**：Jupyter Notebook（文本词频、转化率相关性分析、情感极值）；
- 🤖 **AI 提示词与模型微调**：针对技术博文选题与结构的小型 LoRA 或 Prompt 模版；
- 🌐 **数据镜像**：HuggingFace Datasets 格式转换与同步。

提交 PR 后，优质作品会在本 README 的 **社区作品展台 (Showcase)** 中置顶推荐，并在 [@realchendahuang](https://x.com/realchendahuang) 的推特主页进行展示！

---

## 📜 许可证 (License)

本项目代码与数据均基于 [MIT License](LICENSE) 开源。欢迎自由使用、引用与研究。
