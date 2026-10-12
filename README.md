# open-x-analytics 📊

> **一个独立开发者 4 个月从 0 到 1 万粉的真实全量开源数据集**  
> 作者：[@realchendahuang](https://x.com/realchendahuang) ｜ 包含历史上全量推文文本与逐日后台运营数据，持续同步更新。

<p align="left">
  <a href="https://x.com/realchendahuang"><img src="https://img.shields.io/twitter/follow/realchendahuang?style=social&logo=x" alt="Twitter Follow"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="#"><img src="https://img.shields.io/badge/Status-Living%20Dataset-success" alt="Living Dataset"></a>
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
- 完整包含作者 [@realchendahuang](https://x.com/realchendahuang) 发布的全部 1,084 篇推文完整文本与互动数据；
- 涵盖 120 天逐日大盘（曝光、点赞、收藏、转化关注数、蓝 V 行为切片）；
- 提供 Excel 友好的原生 CSV 与适合开发者直接跑代码的规范 JSONL；
- **项目保持长效维护，后续每个周期会持续增量同步最新后台数据。**

无论你是做**数据科学、自然语言处理（NLP）、大模型微调**，还是想作为**独立开发者研究中文技术内容的真实增长模型**，都可以自由使用这套数据。希望能为大家带来一份真正物超所值的硬核参考。

---

## 📈 数据集基准指标（首发初始快照）

> **说明**：以下为项目立项（2026-10-12 首发版）时的基准数据快照，随着后续周期性增量同步，数据集将持续生长更新。最新的全量数据请直接查阅 `data/` 目录下的实时文件。

| 指标维度 | 官方实测数据 | 说明与洞察 |
|---|---|---|
| **统计周期** | **2026-06-15 ~ 2026-10-12** (120 天) | 覆盖 0 ➔ 10,000 粉丝成长全历程 |
| **总曝光量 (Impressions)** | **18,667,383** | 4 个月近两千万级曝光 |
| **总点赞 (Likes)** | **57,779** | 扎实的高净值互动基底 |
| **总收藏 (Bookmarks)** | **45,352** | 极高资产粘性（案头手册型） |
| **全盘藏赞比 (BM / Likes)** | **0.785** | 远高于泛娱乐账号（通常 0.1~0.2） |
| **净增关注 (Net Follows)** | **+9,851** | 净增粉，达成 10,000 粉丝里程碑 |
| **取关率 (Unfollow Churn)** | **9.1%** (取关 985 人) | 粉丝留存率高达 90.9% |
| **主页访问量 (Profile Visits)** | **37,336** | — |
| **主页转粉率 (Follow / Visit)** | **29.02%** | **平均每 3.4 个点进主页的人就有 1 个关注** |
| **蓝 V 付费人群曝光占比** | **12.2%** (227.8 万) | 贡献了 26.1% 的点赞与 26.2% 的主页访问 |
| **记录推文总篇数** | **1,084 篇** | 613 篇主帖 + 471 篇回复 |

---

## 📂 仓库目录结构

```text
open-x-analytics/
├── data/
│   ├── csv/
│   │   ├── daily_overview.csv          # 120 天逐日大盘（曝光、点赞、收藏、增粉、取关）
│   │   ├── daily_overview_verified.csv # 蓝 V（X Premium）高净值人群专属数据切片
│   │   └── posts_content.csv           # 1,084 篇全量推文正文与互动明细（原生 CSV）
│   └── jsonl/
│       └── posts.jsonl                 # 开发者友好的标准 JSONL 格式（每行一个 JSON，带计算字段）
├── examples/
│   └── quick_start.py                  # 零依赖极简分析脚本（查看资产帖与转化排行）
├── scripts/
│   └── sync.py                         # 官方导出增量去重、清洗与自动化合并工具
├── LICENSE                             # MIT 开源协议
└── README.md
```

---

## 🗄 数据字典与字段说明

### 1. 推文明细表 (`data/csv/posts_content.csv` / `data/jsonl/posts.jsonl`)

| 字段名 (CSV) | JSONL 键名 | 类型 | 说明 |
|---|---|---|---|
| `Post id` | `post_id` | String | 推文唯一推特 ID（可直接拼接成链接） |
| `Date` | `date` | String | 发布日期（如 `"Mon, Sep 28, 2026"`） |
| `Post text` | `text` | String | 推文完整正文（包含换行与 emoji） |
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

### 2. 每日大盘表 (`data/csv/daily_overview.csv`)

包含每天全账户维度的核心指标：
`Date`, `Impressions`, `Likes`, `Engagements`, `Bookmarks`, `Shares`, `New follows`, `Unfollows`, `Replies`, `Reposts`, `Profile visits`, `Create Post`, `Video views`, `Media views`。

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

## 💡 摸索 4 个月以来的几点粗浅体会

数据拉出来看后，我自己有几个很深刻的体会，供大家参考：

1. **比起热闹的点赞，我更珍惜大家的收藏**：
   - 随手发的吃瓜段子可能当时看个乐，但很快就滑过去了；
   - 真正被大家反复收藏的，都是些踩坑踩出来的配置参数、免运维架构、或者分钱级的真实成本账单。这让我意识到，老老实实交付真正能用得上的东西，比蹭热点踏实得多。
2. **感谢大家对“粗糙和踩坑”的包容**：
   - 很多时候在主页记录自己写代码报错、折腾网络卡顿的过程，反而得到了很多同行的共鸣与关注；
   - 真实生活里没有那么多光鲜体面，代码写不通就是写不通，把真实的踩坑过程写出来，大家反而更愿意交流。
3. **最厉害的解法往往在评论区**：
   - 好多次我遇到搞不懂的网络或者架构难题，在推上随手一问，评论区各路大神直接给出了现场诊断和最佳实践；
   - 这 1,000 多篇推文里，很大一部分高质量内容其实是社区的各位老师陪我一起完善出来的。再次感谢大家！

---

## 🔄 持续更新机制 (Update Cadence)

作者会按周或按月从 X 官方创作者后台导出最新分析明细，并使用内置同步脚本合并更新：

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

- **作者**：陈大黄（[@realchendahuang](https://x.com/realchendahuang)）
- **定位**：KOSX（[@kosxai](https://x.com/kosxai)）华东创业与独立开发负责人、AI 科技公司合伙人、Indie Hacker。
- **个人网站**：[chendahuang.com](https://chendahuang.com)
- **正在进行的项目**：
  - [FlareMo](https://chendahuang.com)：基于 Cloudflare 的开源知识库
  - [Cherina Pod](https://chendahuang.com)：双语播客
  - FeedSieve（福滤娃）：已退役的开源黄推清理扩展

欢迎关注我的 X 主页：[https://x.com/realchendahuang](https://x.com/realchendahuang)

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
