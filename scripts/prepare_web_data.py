#!/usr/bin/env python3
"""
为 Web 看板生成精简的静态 JSON 数据。

读取:
  - data/jsonl/posts.jsonl
  - data/csv/daily_overview.csv
输出 (web/public/data/):
  - posts.json     主帖（含全文），首屏加载
  - replies.json   回复帖，用户勾选「包含回复」后才加载
  - overview.json  逐日大盘（按时间升序）
  - summary.json   汇总指标 + 三阶段统计（前端不再硬编码任何统计数字）

约定:
  - 日期统一为 ISO 格式 YYYY-MM-DD
  - 帖子按 post id 降序（雪花 ID 随时间单调递增，等价于最新在前）
  - stage 为稳定 key: icebreaker / growth / flywheel
"""

import csv
import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS_PATH = ROOT / "data" / "jsonl" / "posts.jsonl"
OVERVIEW_PATH = ROOT / "data" / "csv" / "daily_overview.csv"
OUT_DIR = ROOT / "web" / "public" / "data"

PITFALL_KEYWORDS = [
    "踩坑", "避坑", "排查", "翻车", "bug", "教训",
    "复盘", "死锁", "重构", "事故", "警惕",
]

# 内容分类关键词（统一小写匹配）。前端只读取预计算的 tags，不再在浏览器里扫描关键词。
TAG_KEYWORDS = {
    "business": [
        "变现", "传统企业", "数字化", "美金", "商业", "获客", "客户",
        "小老板", "创业", "冷启动", "实体", "成本", "利润", "建站", "fde",
    ],
    "tools": [
        "开源", "github", "esp32", "cloudflare", "工具", "框架", "桌面端",
        "白嫖", "免费", "插件", "项目", "库", "repo",
    ],
    "probes": [
        "好奇", "为什么", "怎么", "请教", "大家", "讨论", "思考",
        "痛点", "agent", "claude code", "codex", "架构",
    ],
}

STAGE_KEYS = (
    ("破冰", "icebreaker"),
    ("增长", "growth"),
    ("飞轮", "flywheel"),
)

ARTICLE_MIN_LENGTH = 800


def stage_key(label: str) -> str:
    for needle, key in STAGE_KEYS:
        if needle in label:
            return key
    return ""


def to_iso_date(raw: str) -> str:
    """'Wed, Oct 28, 2026' -> '2026-10-28'；无法解析时原样返回。"""
    raw = (raw or "").strip()
    try:
        return datetime.strptime(raw, "%a, %b %d, %Y").strftime("%Y-%m-%d")
    except ValueError:
        return raw


def int_of(value) -> int:
    try:
        return int(float(value or 0))
    except (TypeError, ValueError):
        return 0


def float_of(value) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def build_post(item: dict) -> dict:
    text = item.get("text", "") or ""
    lower = text.lower()
    tags = [tag for tag, words in TAG_KEYWORDS.items() if any(w in lower for w in words)]
    return {
        "id": str(item.get("post_id", "")),
        "date": to_iso_date(item.get("date", "")),
        "text": text,
        "link": item.get("link", ""),
        "is_reply": bool(item.get("is_reply", False)),
        "impressions": int_of(item.get("impressions")),
        "likes": int_of(item.get("likes")),
        "bookmarks": int_of(item.get("bookmarks")),
        "new_follows": int_of(item.get("new_follows")),
        "replies": int_of(item.get("replies")),
        "reposts": int_of(item.get("reposts")),
        "url_clicks": int_of(item.get("url_clicks")),
        "bm_like_ratio": round(float_of(item.get("bookmark_like_ratio")), 3),
        "stage": stage_key(item.get("follower_stage", "")),
        "viral_ratio": round(float_of(item.get("viral_ratio")), 1),
        "followers_at_post": int_of(item.get("followers_at_post")),
        "daily_impressions": round(float_of(item.get("daily_impressions")), 1),
        "daily_new_follows": round(float_of(item.get("daily_new_follows")), 2),
        "is_pitfall": any(k in lower for k in PITFALL_KEYWORDS),
        "is_article": len(text) > ARTICLE_MIN_LENGTH or text.startswith("# "),
        "tags": tags,
    }


def load_posts() -> list[dict]:
    posts = []
    with POSTS_PATH.open(encoding="utf-8") as f:
        for line in f:
            if line.strip():
                posts.append(build_post(json.loads(line)))
    posts.sort(key=lambda p: int_of(p["id"]), reverse=True)
    return posts


def load_overview() -> list[dict]:
    records = []
    with OVERVIEW_PATH.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            new_follows = int_of(row.get("New follows"))
            unfollows = int_of(row.get("Unfollows"))
            records.append({
                "date": to_iso_date(row.get("Date", "")),
                "impressions": int_of(row.get("Impressions")),
                "likes": int_of(row.get("Likes")),
                "engagements": int_of(row.get("Engagements")),
                "bookmarks": int_of(row.get("Bookmarks")),
                "shares": int_of(row.get("Shares")),
                "new_follows": new_follows,
                "unfollows": unfollows,
                "net_follows": new_follows - unfollows,
                "replies": int_of(row.get("Replies")),
                "reposts": int_of(row.get("Reposts")),
                "profile_visits": int_of(row.get("Profile visits")),
                "posts_count": int_of(row.get("Create Post")),
            })
    records.sort(key=lambda r: r["date"])
    return records


def stage_stats(main_posts: list[dict]) -> list[dict]:
    """按成长阶段聚合主帖。藏赞比用合计口径（总收藏 / 总点赞），避免被零赞帖拉偏。"""
    stats = []
    for _, key in STAGE_KEYS:
        group = [p for p in main_posts if p["stage"] == key]
        n = len(group)
        if n == 0:
            stats.append({
                "key": key, "count": 0, "avg_impressions": 0, "avg_likes": 0,
                "bm_like_ratio": 0, "avg_viral_ratio": 0, "max_viral_ratio": 0,
                "max_viral_post_id": "", "max_viral_snippet": "",
            })
            continue
        likes = sum(p["likes"] for p in group)
        best = max(group, key=lambda p: p["viral_ratio"])
        stats.append({
            "key": key,
            "count": n,
            "avg_impressions": round(sum(p["impressions"] for p in group) / n),
            "avg_likes": round(likes / n, 1),
            "bm_like_ratio": round(sum(p["bookmarks"] for p in group) / max(likes, 1), 3),
            "avg_viral_ratio": round(sum(p["viral_ratio"] for p in group) / n, 1),
            "max_viral_ratio": best["viral_ratio"],
            "max_viral_post_id": best["id"],
            "max_viral_snippet": " ".join(best["text"].split())[:40],
        })
    return stats


def build_summary(posts: list[dict], overview: list[dict]) -> dict:
    main = [p for p in posts if not p["is_reply"]]
    total_likes = sum(p["likes"] for p in posts)
    total_bookmarks = sum(p["bookmarks"] for p in posts)
    ov_new = sum(r["new_follows"] for r in overview)
    ov_unf = sum(r["unfollows"] for r in overview)
    ov_net = ov_new - ov_unf
    return {
        "total_posts": len(posts),
        "main_posts": len(main),
        "reply_posts": len(posts) - len(main),
        "total_impressions": sum(p["impressions"] for p in posts),
        "total_likes": total_likes,
        "total_bookmarks": total_bookmarks,
        "total_new_follows": sum(p["new_follows"] for p in posts),
        "overall_bm_like_ratio": round(total_bookmarks / max(total_likes, 1), 3),
        "pitfall_count": sum(1 for p in posts if p["is_pitfall"]),
        "max_single_follow": max((p["new_follows"] for p in posts), default=0),
        "overview_impressions": sum(r["impressions"] for r in overview),
        "overview_new_follows": ov_new,
        "overview_unfollows": ov_unf,
        "overview_net_follows": ov_net,
        "retention_rate": round(ov_net / max(ov_new, 1) * 100, 1),
        "overview_days": len(overview),
        "data_start": overview[0]["date"] if overview else "",
        "data_through": overview[-1]["date"] if overview else "",
        "stages": stage_stats(main),
    }


def write_json(name: str, payload, **kwargs) -> None:
    path = OUT_DIR / name
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, **kwargs)
    print(f"✅ {name:<14} {path.stat().st_size / 1024:>8.0f} KB")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    posts = load_posts()
    overview = load_overview()
    compact = {"separators": (",", ":")}

    write_json("posts.json", [p for p in posts if not p["is_reply"]], **compact)
    write_json("replies.json", [p for p in posts if p["is_reply"]], **compact)
    write_json("overview.json", overview, **compact)
    write_json("summary.json", build_summary(posts, overview), indent=2)


if __name__ == "__main__":
    main()
