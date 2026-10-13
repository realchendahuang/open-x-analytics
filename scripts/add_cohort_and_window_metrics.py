#!/usr/bin/env python3
"""
open-x-analytics · 粉丝分段与观察窗口归一化工程 (Cohort & Lifecycle Metrics)
=============================================================================
根据数据科学专家建议与内容增长复盘方法论：
1. 标记采集时间 (snapshot_at = 2026-10-12T23:59:59+08:00)。
2. 统一观察窗口：计算 post_age_days，并输出日均指标 (daily_impressions, daily_likes, daily_new_follows)，
   解决“老帖累积数月 vs 新帖发布数天/数小时”的横向对比偏差。
3. 粉丝规模分段 (Cohort Segmentation)：
   从 daily_overview.csv 逆向推导发帖当天的真实粉丝基数 (followers_at_post) 与成长阶段：
   - 🌱 破冰期 (Stage 1: 0~1,000 粉丝)
   - 🚀 增长期 (Stage 2: 1,000~5,000 粉丝)
   - ⚡ 飞轮期 (Stage 3: 5,000~10,000 粉丝)
4. 计算受众穿透指数 (viral_ratio = impressions / followers_at_post)，
   剥离已有受众基数红利，真实呈现文案本身的裂变力与穿透力。
"""

import os
import sys
import csv
import json
import re
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = REPO_ROOT / "data"
DAILY_CSV = DATA_DIR / "csv" / "daily_overview.csv"
POSTS_CSV = DATA_DIR / "csv" / "posts_content.csv"
POSTS_JSONL = DATA_DIR / "jsonl" / "posts.jsonl"

SNAPSHOT_DATE_STR = "2026-10-12"
SNAPSHOT_DATETIME = datetime(2026, 10, 12, 23, 59, 59)
SNAPSHOT_ISO = "2026-10-12T23:59:59+08:00"


def parse_date(date_str: str) -> datetime:
    if not date_str:
        return datetime(2026, 6, 15)
    date_str = date_str.strip()
    for fmt in ("%a, %b %d, %Y", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(date_str[:25] if "T" in date_str else date_str, fmt)
        except ValueError:
            pass
    return datetime(2026, 6, 15)


def build_follower_timeline() -> dict[str, int]:
    """从 daily_overview.csv 建立每个日期的累计粉丝数映射表"""
    if not DAILY_CSV.exists():
        print(f"[-] Missing daily overview CSV: {DAILY_CSV}", file=sys.stderr)
        return {}

    daily_records = []
    with open(DAILY_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            d_str = r["Date"].strip()
            dt = parse_date(d_str)
            new_f = int(r.get("New follows", 0) or 0)
            unf = int(r.get("Unfollows", 0) or 0)
            daily_records.append({"date": dt, "date_str": d_str, "net": new_f - unf})

    # 按时间正序升序排列
    daily_records.sort(key=lambda x: x["date"])

    # 初始粉丝约 149（根据 10,000 减去净增 9,851）
    current_followers = 149
    timeline = {}
    for r in daily_records:
        current_followers += r["net"]
        iso_day = r["date"].strftime("%Y-%m-%d")
        timeline[iso_day] = max(current_followers, 1)

    return timeline


def get_follower_stage(followers: int) -> str:
    if followers < 1000:
        return "🌱 破冰期 (0~1K)"
    elif followers < 5000:
        return "🚀 增长期 (1K~5K)"
    else:
        return "⚡ 飞轮期 (5K~10K)"


def main():
    print("=" * 60)
    print("🚀 开始注入粉丝分段、观察窗口与采集时间指标")
    print("=" * 60)

    timeline = build_follower_timeline()
    print(f"[*] 成功计算 {len(timeline)} 天的粉丝成长轨迹。")

    if not POSTS_JSONL.exists():
        print(f"[-] Posts JSONL not found: {POSTS_JSONL}", file=sys.stderr)
        return

    with open(POSTS_JSONL, "r", encoding="utf-8") as f:
        posts = [json.loads(line) for line in f]

    print(f"[*] 读取推文总数: {len(posts)} 篇")

    stage_counts = {"🌱 破冰期 (0~1K)": 0, "🚀 增长期 (1K~5K)": 0, "⚡ 飞轮期 (5K~10K)": 0}

    enhanced_posts = []
    for p in posts:
        post_dt = parse_date(p.get("date", ""))
        post_day_str = post_dt.strftime("%Y-%m-%d")

        # 匹配发帖时粉丝基数
        followers_at_post = timeline.get(post_day_str)
        if not followers_at_post:
            # 兜底匹配最接近日期
            if post_dt < datetime(2026, 6, 15):
                followers_at_post = 150
            elif post_dt > datetime(2026, 10, 12):
                followers_at_post = 10000
            else:
                followers_at_post = 2000

        stage = get_follower_stage(followers_at_post)
        stage_counts[stage] += 1

        # 计算发布后观察时间窗口（天数）
        age_days = max((SNAPSHOT_DATETIME.date() - post_dt.date()).days, 1)

        imp = int(p.get("impressions", 0) or 0)
        likes = int(p.get("likes", 0) or 0)
        bm = int(p.get("bookmarks", 0) or 0)
        new_f = int(p.get("new_follows", 0) or 0)

        # 归一化速率指标
        daily_imp = round(imp / age_days, 1)
        daily_likes = round(likes / age_days, 2)
        daily_new_follows = round(new_f / age_days, 2)

        # 剥离受众基数的裂变穿透力指数 (Viral Ratio)
        viral_ratio = round(imp / max(followers_at_post, 10), 2)

        # 每万次曝光转化关注数
        follow_rate_per_10k = round(new_f / max(imp, 1) * 10000, 2)

        # 注入增强字段
        p["snapshot_at"] = SNAPSHOT_ISO
        p["post_age_days"] = age_days
        p["followers_at_post"] = followers_at_post
        p["follower_stage"] = stage
        p["viral_ratio"] = viral_ratio
        p["daily_impressions"] = daily_imp
        p["daily_likes"] = daily_likes
        p["daily_new_follows"] = daily_new_follows
        p["follow_rate_per_10k"] = follow_rate_per_10k

        enhanced_posts.append(p)

    # 写回 posts.jsonl
    with open(POSTS_JSONL, "w", encoding="utf-8") as f:
        for p in enhanced_posts:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

    print("\n" + "=" * 60)
    print("✅ 粉丝分段与观察窗口增强完成！")
    print(f"1. 采集快照时间: {SNAPSHOT_ISO}")
    print("2. 推文成长阶段分布:")
    for s, c in stage_counts.items():
        print(f"   ├─ {s}: {c} 篇 ({c/len(enhanced_posts)*100:.1f}%)")
    print("3. 已新增字段: post_age_days, followers_at_post, follower_stage,")
    print("              viral_ratio, daily_impressions, daily_likes, follow_rate_per_10k")
    print(f"4. 已安全写回: {POSTS_JSONL.name}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
