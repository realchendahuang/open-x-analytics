# open-x-analytics 📊

> **一个独立开发者从 0 到 1 万粉丝的完整开源数据集**  
> 作者：[@realchendahuang](https://x.com/realchendahuang) ｜ 包含全部推文原文和每天的后台运营数据，持续更新。

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

很多社媒分享只给结果截图，或者只挑好看的片段。这个项目放出的是**完整的一手数据，没有挑选，任何人都可以自己复算**：
- 作者 [@realchendahuang](https://x.com/realchendahuang) 的全部 **10,346 篇推文原文和互动数据**（1,844 篇主帖和 8,502 篇回复），时间跨度 2024-05 到 2026-10（截至 2026-10-21 的数据）；
- **长推是全文，不是官方后台导出的 280 字截断版**：最长一篇接近 14,000 字，代码块和排版都保留；
- 每天的账号大盘：2026-06-15 到 2026-10-21 共 127 天有数据（10-13、10-14 两天官方后台没有导出），包含曝光、点赞、收藏、新增关注和取关；另有蓝 V（X Premium）用户的单独切片，目前只更新到 2026-10-12；
- 提供 Excel 友好的原生 CSV 与适合开发者直接跑代码的规范 JSONL；
- **项目保持长效维护，后续每个周期会持续增量同步最新后台数据。**

无论你是做**数据科学、自然语言处理（NLP）、大模型微调**，还是想作为**独立开发者研究中文技术内容的真实增长模型**，都可以自由使用这套数据。希望能为大家带来一份真正物超所值的硬核参考。

---

## 📈 核心指标

以下数字都来自 `data/csv/daily_overview.csv`（X 后台的逐日账号总览），可以用几行代码自己复算。「首发快照」是项目 2026-10-12 首发时的数字，「当前」随数据同步更新。

| 指标 | 首发快照（06-15 ~ 10-12，120 天） | 当前（06-15 ~ 10-21，127 天） | 说明 |
|---|---|---|---|
| 总曝光 | 18,667,383 | 20,591,808 | |
| 总点赞 | 57,779 | 67,101 | |
| 总收藏 | 45,352 | 54,938 | |
| 藏赞比（收藏 ÷ 点赞） | 0.785 | 0.819 | 内容类账号常见在 0.1~0.2 左右，这个账号高很多，说明读者倾向于收藏备查 |
| 净增关注 | +9,851 | +11,091 | 新增减去取关 |
| 取关占新增的比例 | 9.1%（取关 985 人） | 9.1%（取关 1,108 人） | 留存 90.9% |
| 主页访问 | 37,336 | 41,071 | |
| 主页访问转关注率 | 29.02% | 29.70% | 新增关注 ÷ 主页访问，约每 3.4 个访问者就有 1 人关注 |
| 蓝 V 用户曝光占比 | 12.2%（227.8 万） | 暂无 | 蓝 V 切片只更新到 10-12；这部分用户贡献了 26.1% 的点赞和 26.2% 的主页访问 |
| 推文总数 | 9,150 篇 | 10,346 篇 | 1,844 篇主帖和 8,502 篇回复 |

> **数据说明**
> - 逐日大盘在 10-13、10-14 两天缺失（官方后台没有导出），所以 127 天不是连续区间。
> - 「藏赞比 0.879」是网页看板里的另一个数：它用的是推文明细（`posts.jsonl`）里全部推文的收藏和点赞合计，覆盖的推文范围比逐日大盘更广，两个口径不要混用。
> - 推文明细里有 433 篇主帖没有曝光等指标（补录的历史内容，官方后台没有导出），统计时按 0 处理。

---

## 📂 仓库目录结构

```text
open-x-analytics/
├── data/
│   ├── csv/
│   │   ├── daily_overview.csv          # 逐日大盘（曝光、点赞、收藏、增粉、取关），127 天
│   │   ├── daily_overview_verified.csv # 蓝 V（X Premium）用户的数据切片，目前到 2026-10-12
│   │   └── posts_content.csv           # 全部推文的正文与互动明细（全文，CSV）
│   └── jsonl/
│       └── posts.jsonl                 # JSONL 格式，另加成长阶段、观察窗口等计算字段
├── examples/
│   ├── dashboard.html                  # 单文件看板，浏览器双击即可打开，不需要安装依赖
│   ├── stage_and_pitfall_analysis.py   # 按粉丝阶段对比，并统计踩坑类推文的涨粉表现
│   └── quick_start.py                  # 最简示例：藏赞比最高的推文、带来关注最多的推文
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

## 🔬 分析示例：成长阶段与踩坑类内容

### 1. 为什么要按粉丝阶段、按观察时长来比较

只按曝光量排序找「爆款」，容易得出误导性的结论，原因有两个：

1. **发布时间不同**：发了几个月的老帖已经积累了长尾流量和收藏，昨天刚发的推文还没来得及积累。所以数据里加了 `snapshot_at`（采集时间）和 `post_age_days`（发布至今的天数），并提供 `daily_impressions` 等日均指标。
2. **发帖时的粉丝数不同**：粉丝 9,000 时随手发一条也有几千曝光，粉丝不到 1,000 时只能靠内容本身被推荐。

所以用 `viral_ratio`（曝光量 ÷ 发帖时粉丝数）扣掉粉丝基数的影响。下表只统计**有曝光数据的原创主帖**（共 1,411 篇；另有 433 篇主帖是补录的历史内容，没有曝光数据）：

| 成长阶段 | 主帖数 | 平均曝光 | 穿透倍率·平均 | 穿透倍率·中位数 | 穿透倍率·最高 | 藏赞比 |
|---|---|---|---|---|---|---|
| 🌱 破冰期（0~1K） | 16 | 10,703 | 14.0 | 0.4 | 135.3 | 1.30 |
| 🚀 增长期（1K~5K） | 589 | 10,606 | 3.7 | 0.7 | 141.5 | 0.90 |
| ⚡ 飞轮期（5K~10K） | 806 | 14,831 | 2.1 | 0.3 | 258.2 | 0.90 |

（藏赞比为该阶段收藏合计 ÷ 点赞合计。发帖时的粉丝数由逐日净增粉倒推，是估算值。）

**怎么读这张表：** 破冰期的平均穿透倍率最高，但这是被极少数帖子拉上去的：16 篇里只有 3 篇超过 10 倍，其中前 3 篇就占了倍率总和的 94%，而中位数只有 0.4。三个阶段的中位数都低于 1，也就是说大多数推文的曝光没有超过当时的粉丝数，真正的出圈靠的是少数几条。

最典型的一条是 2026 年 6 月 15 日，作者在粉丝约 765 人时发的 Cloudflare 经验长推，得到 103,531 次曝光，穿透倍率 135.3。不过破冰期只有十几篇样本，不足以得出「冷启动阶段更容易出圈」这样的一般结论。

### 2. 踩坑、排查、复盘类的推文表现如何

用关键词（`踩坑`、`避坑`、`排查`、`翻车`、`bug`、`教训`、`复盘`、`死锁`、`重构`、`事故`、`警惕`）匹配出 190 篇推文，其中原创主帖且有曝光数据的有 126 篇。和其余的 1,285 篇主帖相比：

| | 踩坑类主帖 | 其余主帖 |
|---|---|---|
| 篇数 | 126 | 1,285 |
| 藏赞比 | 1.07 | 0.87 |
| 藏赞比 ≥ 1 的帖子占比 | 38% | 18% |
| 篇均新增关注 | 7.1 | 3.0 |
| 篇均曝光 | 16,610 | 12,669 |

踩坑类推文的收藏比点赞更多，涨粉也更多，这个差异是稳定的，但幅度不算夸张。其中单条涨粉最多的是 2026 年 9 月 28 日那篇关于架构选型和配置避坑的推文：直接带来 163 个新关注，3,227 次收藏，175,755 次曝光。

以上关键词是按推文是否出现这些词来匹配的，不判断内容是否真的是踩坑复盘，会有误判和遗漏。不同脚本用的关键词表不完全相同（网页看板 11 个词，`examples/stage_and_pitfall_analysis.py` 更多，且包含回复），所以篇数会略有出入。

运行示例脚本可以看到更多细节（该脚本统计时包含回复帖，数字和上表口径不同）：

```bash
python3 examples/stage_and_pitfall_analysis.py
```

---

## 📊 在线看板

**在线访问：** [chendahuang.com/x](https://chendahuang.com/x/) ｜ 备用地址：[GitHub Pages](https://realchendahuang.github.io/open-x-analytics/)

看板在 `web/` 目录，用 React 19、TypeScript、Vite、Tailwind CSS 和 ECharts 写成，是纯静态页面。

- **核心指标和阶段对比**：曝光、涨粉、留存，以及三个粉丝阶段的内容表现。
- **推文分布图**：每个点是一篇主帖，横轴是曝光，纵轴是藏赞比，点的大小是新增关注数。可以按阶段筛选，也可以只看踩坑类推文，点击圆点直接看全文。
- **每日趋势**：每天的曝光、收藏和净增粉丝，可以拖动滑块放大某一段。
- **推文检索**：按正文或推文 ID 搜索，可按类型和数据筛选，每条推文都有可分享的链接。

在本地运行（需要先安装 [pnpm](https://pnpm.io)，并在**仓库根目录**执行，因为它会先用 `data/` 生成看板需要的数据文件）：

```bash
pnpm install
pnpm dev     # 开发服务器 http://localhost:3000
pnpm build   # 生成数据并构建到 web/dist
```

另外保留了一个单文件版本 `examples/dashboard.html`，不用安装任何依赖，双击就能在浏览器里打开。

---

## 🚀 快速开始

仓库里的 Python 示例脚本不依赖任何第三方库，克隆后可以直接运行：

```bash
# 1. 克隆仓库
git clone https://github.com/realchendahuang/open-x-analytics.git
cd open-x-analytics

# 2. 运行最简示例
python3 examples/quick_start.py
```

### 用 Pandas 分析

```python
import pandas as pd

# 读取 JSONL
df = pd.read_json("data/jsonl/posts.jsonl", lines=True)

# 取原创主帖里点赞 >= 100 的，按藏赞比从高到低排序
assets = df[(~df["is_reply"]) & (df["likes"] >= 100)].sort_values(
    by="bookmark_like_ratio", ascending=False
)

print(assets[["date", "bookmark_like_ratio", "bookmarks", "likes", "impressions", "text"]].head(10))
```

---

## 🔄 数据更新

作者会定期从 X 官方后台导出最新数据，用同步脚本合并：

```bash
# 合并、去重，并重新生成 JSONL
python3 scripts/sync.py \
  --overview ~/Downloads/account_overview_analytics.csv \
  --verified "~/Downloads/account_overview_analytics (1).csv" \
  --content ~/Downloads/account_analytics_content_*.csv
```

每次更新会打一个 Git Tag（例如 `v2026.10`、`v2026.11`）作为版本记录。

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
