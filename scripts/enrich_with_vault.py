#!/usr/bin/env python3
"""
open-x-analytics · Vault 无损深度回填与补全工具 (Enrich with Vault)
=====================================================================
利用作者私有知识库 solo-life-os-vault 已有的 2,602 篇 Markdown 全文：
1. 彻底解决 X 官方后台 CSV 截断长推（280 字限制）的硬伤，将深度技术长推全文回填。
2. 补齐原导出遗漏的 1,300+ 篇推文与深度互动回帖，实现真正全量 2,600+ 篇。
3. 严格遵循原生字段契约，同步更新 data/csv/posts_content.csv 与 data/jsonl/posts.jsonl。
"""

import os
import sys
import csv
import json
import re
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
VAULT_DIR = Path("/Users/kim/code/solo-life-os-vault")
DATA_DIR = REPO_ROOT / "data"
CSV_PATH = DATA_DIR / "csv" / "posts_content.csv"
JSONL_PATH = DATA_DIR / "jsonl" / "posts.jsonl"

STATUS_RE = re.compile(r"/status(?:es)?/(\d+)")
BACKFILL_RE = re.compile(
    r"impressions=(\d+)\s+likes=(\d+)\s+engagements=(\d+)\s+bookmarks=(\d+)\s+shares=(\d+)\s+new_follows=(\d+)\s+replies=(\d+)\s+reposts=(\d+)\s+profile_visits=(\d+)\s+detail_expands=(\d+)\s+link_clicks=(\d+)\s+hashtag_clicks=(\d+)\s+permalink_clicks=(\d+)"
)

CSV_FIELDNAMES = [
    "Post id",
    "Date",
    "Post text",
    "Post Link",
    "Impressions",
    "Likes",
    "Bookmarks",
    "Engagements",
    "Shares",
    "New follows",
    "Replies",
    "Reposts",
    "Profile visits",
    "Detail Expands",
    "URL Clicks",
    "Hashtag Clicks",
    "Permalink Clicks",
]


def parse_date(date_str: str) -> datetime:
    if not date_str:
        return datetime.min
    date_str = date_str.strip()
    for fmt in ("%a, %b %d, %Y", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(date_str[:25] if "T" in date_str else date_str, fmt)
        except ValueError:
            pass
    return datetime.min


def format_display_date(date_val: str) -> str:
    if not date_val:
        return ""
    # 如果已经形如 "Mon, Sep 28, 2026" 直接返回
    if re.match(r"^[A-Z][a-z]{2},\s+[A-Z][a-z]{2}\s+\d+,\s+\d{4}", date_val):
        return date_val
    try:
        # 尝试从 ISO 格式提取日期
        if "T" in date_val:
            dt = datetime.fromisoformat(date_val)
            return dt.strftime("%a, %b %d, %Y")
        if re.match(r"^\d{4}-\d{2}-\d{2}", date_val):
            dt = datetime.strptime(date_val[:10], "%Y-%m-%d")
            return dt.strftime("%a, %b %d, %Y")
    except Exception:
        pass
    return date_val


def clean_body_text(raw_body: str) -> str:
    body = raw_body.strip()
    # 截断 ## 我的批注 或 ## 数据回采 之前的内容
    body = re.split(r"\n##\s+(?:我的批注|数据回采)", body)[0].strip()
    return body


def load_vault_posts():
    sys.path.insert(0, str(VAULT_DIR / ".agents/skills/x-operations/scripts"))
    import frontmatter

    vault_posts = {}
    posts_dir = VAULT_DIR / "workspace" / "004-posts" / "x"
    if not posts_dir.exists():
        print(f"[-] Vault posts directory not found: {posts_dir}", file=sys.stderr)
        return vault_posts

    for p in posts_dir.glob("**/*.md"):
        try:
            meta, raw_body = frontmatter.load(p)
        except Exception:
            continue

        url = meta.get("post_url", "")
        m = STATUS_RE.search(url)
        if not m:
            continue
        pid = m.group(1)

        clean_text = clean_body_text(raw_body)
        bf_matches = BACKFILL_RE.findall(raw_body)
        latest_bf = bf_matches[-1] if bf_matches else None

        posted_at = meta.get("posted_at", "")
        metrics = meta.get("metrics") or {}

        # 优先保留文本更长的记录
        if pid not in vault_posts or len(clean_text) > len(vault_posts[pid]["text"]):
            vault_posts[pid] = {
                "path": p,
                "pid": pid,
                "url": url or f"https://x.com/realchendahuang/status/{pid}",
                "posted_at": posted_at,
                "is_reply": "replies" in str(p.parent) or clean_text.startswith("@"),
                "text": clean_text,
                "metrics": metrics,
                "backfill": latest_bf,
            }

    return vault_posts


def main():
    print("=" * 60)
    print("🚀 开始执行 open-x-analytics · Vault 无损深度回填与补全")
    print("=" * 60)

    # 1. 加载现有数据
    existing_rows = {}
    if CSV_PATH.exists():
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                pid = row["Post id"].strip()
                existing_rows[pid] = row
    print(f"[*] 现有 CSV 包含推文: {len(existing_rows)} 篇")

    # 2. 加载 Vault 本地推文
    vault_posts = load_vault_posts()
    print(f"[*] Vault 本地索引到推文: {len(vault_posts)} 篇")

    # 3. 融合与修复
    upgraded_text_count = 0
    added_count = 0
    recovered_chars = 0

    merged_data = {}

    # 首先加入现有行，并用 Vault 的完整正文修复截断
    for pid, row in existing_rows.items():
        v = vault_posts.get(pid)
        current_text = row.get("Post text", "").strip()
        if v and len(v["text"]) > len(current_text):
            recovered_chars += (len(v["text"]) - len(current_text))
            upgraded_text_count += 1
            row["Post text"] = v["text"]

        merged_data[pid] = row

    # 接着加入 Vault 中独有的推文
    for pid, v in vault_posts.items():
        if pid in merged_data:
            continue

        added_count += 1
        m = v["metrics"]
        bf = v["backfill"]

        display_date = format_display_date(v["posted_at"])

        if bf:
            # 来自 ## 数据回采 行的完整官方级指标
            (
                impressions,
                likes,
                engagements,
                bookmarks,
                shares,
                new_follows,
                replies,
                reposts,
                profile_visits,
                detail_expands,
                link_clicks,
                hashtag_clicks,
                permalink_clicks,
            ) = bf
        else:
            # 来自 frontmatter 的基础指标
            impressions = str(m.get("views", 0) or 0)
            likes = str(m.get("likes", 0) or 0)
            bookmarks = str(m.get("bookmarks", 0) or 0)
            replies = str(m.get("replies", 0) or 0)
            reposts = str(m.get("reposts", 0) or 0)
            link_clicks = str(m.get("link_clicks", 0) or 0)
            engagements = str(int(likes) + int(bookmarks) + int(replies) + int(reposts) + int(link_clicks))
            shares = "0"
            new_follows = "0"
            profile_visits = "0"
            detail_expands = "0"
            hashtag_clicks = "0"
            permalink_clicks = "0"

        new_row = {
            "Post id": pid,
            "Date": display_date,
            "Post text": v["text"],
            "Post Link": v["url"],
            "Impressions": impressions,
            "Likes": likes,
            "Bookmarks": bookmarks,
            "Engagements": engagements,
            "Shares": shares,
            "New follows": new_follows,
            "Replies": replies,
            "Reposts": reposts,
            "Profile visits": profile_visits,
            "Detail Expands": detail_expands,
            "URL Clicks": link_clicks,
            "Hashtag Clicks": hashtag_clicks,
            "Permalink Clicks": permalink_clicks,
        }
        merged_data[pid] = new_row

    # 4. 排序：按发布日期降序，再按 Post id 降序
    sorted_rows = sorted(
        merged_data.values(),
        key=lambda x: (parse_date(x.get("Date", "")), int(x["Post id"]) if x["Post id"].isdigit() else 0),
        reverse=True,
    )

    # 5. 写回 CSV
    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDNAMES)
        writer.writeheader()
        writer.writerows(sorted_rows)

    # 6. 生成标准 JSONL
    JSONL_PATH.parent.mkdir(parents=True, exist_ok=True)
    jsonl_count = 0
    reply_count = 0
    main_count = 0
    total_likes = 0
    total_bookmarks = 0
    total_impressions = 0

    with open(JSONL_PATH, "w", encoding="utf-8") as f:
        for row in sorted_rows:
            text = row.get("Post text", "").strip()
            is_reply = text.startswith("@")
            likes = int(row.get("Likes", 0) or 0)
            bookmarks = int(row.get("Bookmarks", 0) or 0)
            impressions = int(row.get("Impressions", 0) or 0)

            total_likes += likes
            total_bookmarks += bookmarks
            total_impressions += impressions

            if is_reply:
                reply_count += 1
            else:
                main_count += 1

            item = {
                "post_id": row.get("Post id", "").strip(),
                "date": row.get("Date", "").strip(),
                "text": text,
                "link": row.get("Post Link", "").strip(),
                "is_reply": is_reply,
                "impressions": impressions,
                "likes": likes,
                "bookmarks": bookmarks,
                "engagements": int(row.get("Engagements", 0) or 0),
                "shares": int(row.get("Shares", 0) or 0),
                "new_follows": int(row.get("New follows", 0) or 0),
                "replies": int(row.get("Replies", 0) or 0),
                "reposts": int(row.get("Reposts", 0) or 0),
                "profile_visits": int(row.get("Profile visits", 0) or 0),
                "detail_expands": int(row.get("Detail Expands", 0) or 0),
                "url_clicks": int(row.get("URL Clicks", 0) or 0),
                "hashtag_clicks": int(row.get("Hashtag Clicks", 0) or 0),
                "permalink_clicks": int(row.get("Permalink Clicks", 0) or 0),
                "bookmark_like_ratio": round(bookmarks / likes, 3) if likes > 0 else 0.0,
            }
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
            jsonl_count += 1

    print("\n" + "=" * 60)
    print("✅ 融合与回填完成！")
    print(f"1. 总推文数: {jsonl_count} 篇 (+{added_count} 篇来自 Vault)")
    print(f"   ├─ 主帖: {main_count} 篇")
    print(f"   └─ 回帖/讨论: {reply_count} 篇")
    print(f"2. 长文截断修复: {upgraded_text_count} 篇长文彻底还原，挽回 {recovered_chars:,} 字符技术正文")
    print(f"3. 累计指标汇总:")
    print(f"   ├─ 总曝光: {total_impressions:,}")
    print(f"   ├─ 总点赞: {total_likes:,}")
    print(f"   ├─ 总收藏: {total_bookmarks:,}")
    print(f"   └─ 全盘藏赞比: {round(total_bookmarks / total_likes, 3) if total_likes > 0 else 0.0}")
    print(f"4. 已安全写回: {CSV_PATH.name} 与 {JSONL_PATH.name}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
