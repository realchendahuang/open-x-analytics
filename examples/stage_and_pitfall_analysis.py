#!/usr/bin/env python3
"""
open-x-analytics · 粉丝分段对比与硬核踩坑复盘
==============================================
针对社媒数据科学与内容增长的核心命题：
1. 剥离受众基数红利：按发帖时粉丝规模（0~1K 破冰期 / 1K~5K 增长期 / 5K~10K 飞轮期）分段对比；
2. 挖掘长尾价值：观察早期低曝光但高穿透率的破冰推文；
3. 实证复盘：究竟哪些真实的「踩坑记录」真正带来了高质量关注与极高收藏？
"""

import os
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
JSONL_PATH = REPO_ROOT / "data/jsonl/posts.jsonl"

PITFALL_KEYWORDS = [
    "踩坑", "踩过", "避坑", "排查", "翻车", "bug", "教训", "复盘",
    "重构", "死锁", "内存溢出", "慢查询", "折腾", "掉坑", "劣化", "屎山"
]


def load_posts():
    if not JSONL_PATH.exists():
        print(f"[-] Missing posts JSONL: {JSONL_PATH}")
        return []
    with open(JSONL_PATH, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f]


def is_pitfall_post(text: str) -> bool:
    t_lower = text.lower()
    return any(k in t_lower for k in PITFALL_KEYWORDS)


def main():
    posts = load_posts()
    if not posts:
        return

    print("=" * 72)
    print("  open-x-analytics · 粉丝分段对比与踩坑记录实证复盘")
    print("=" * 72)

    # 1. 阶段统计
    stages = {}
    for p in posts:
        stage = p.get("follower_stage", "未分段")
        if stage not in stages:
            stages[stage] = []
        stages[stage].append(p)

    print("\n📊 【阶段概览：剥离粉丝基数红利的真实穿透力】")
    print(f"{'成长阶段':<18} | {'推文数':<6} | {'平均曝光':<10} | {'平均点赞':<8} | {'平均穿透倍率':<12} | {'平均藏赞比':<8}")
    print("-" * 74)

    for stage_name, s_posts in sorted(stages.items()):
        total_p = len(s_posts)
        avg_imp = sum(p.get("impressions", 0) for p in s_posts) / total_p
        avg_likes = sum(p.get("likes", 0) for p in s_posts) / total_p
        avg_viral = sum(p.get("viral_ratio", 0) for p in s_posts) / total_p
        bm_posts = [p for p in s_posts if p.get("likes", 0) > 0]
        avg_bm_ratio = sum(p.get("bookmark_like_ratio", 0) for p in bm_posts) / len(bm_posts) if bm_posts else 0.0

        print(f"{stage_name:<16} | {total_p:<6} | {avg_imp:<10,.0f} | {avg_likes:<8.1f} | {avg_viral:<10.1f}x | {avg_bm_ratio:<8.3f}")

    print("\n💡 洞察：破冰期的平均穿透倍率往往最高！0 到 1,000 粉阶段的每一篇出圈推文，都依靠极高密度的干货撬动了数倍于自身粉丝基数的冷启动流量。\n")

    # 2. 破冰期 (0~1K) 的高穿透经典长尾帖
    stage_1_posts = stages.get("🌱 破冰期 (0~1K)", [])
    if stage_1_posts:
        print("🌱 【破冰期 (0~1K 粉丝) 最具穿透力的长尾破冰神帖 (Top 5)】")
        # 排除纯回复，按穿透倍率排序
        breakthrough = [p for p in stage_1_posts if not p.get("is_reply")]
        breakthrough.sort(key=lambda x: x.get("viral_ratio", 0), reverse=True)

        for i, p in enumerate(breakthrough[:5], 1):
            text_preview = p.get("text", "").replace("\n", " ")[:65]
            print(f"#{i} [{p.get('date')}] 穿透倍率: {p.get('viral_ratio')}x (当时粉丝仅 ~{p.get('followers_at_post')})")
            print(f"   曝光: {p.get('impressions'):,} | 点赞: {p.get('likes')} | 收藏: {p.get('bookmarks')} | 增粉: +{p.get('new_follows')}")
            print(f"   正文: \"{text_preview}...\"")
            print(f"   链接: {p.get('link')}\n")

    # 3. 踩坑记录专题复盘
    pitfall_posts = [p for p in posts if is_pitfall_post(p.get("text", ""))]
    print("=" * 72)
    print(f"🛠️ 【硬核实证：真实的「踩坑记录」到底带来了多少关注？】")
    print(f"全库共识别出 {len(pitfall_posts)} 篇深度踩坑/避坑/Bug排查推文与回帖。")
    print("=" * 72)

    # 按直接增粉排序
    pitfall_converters = [p for p in pitfall_posts if not p.get("is_reply")]
    pitfall_converters.sort(key=lambda x: x.get("new_follows", 0), reverse=True)

    print("\n🔥 【直接增粉最多的 Top 5 踩坑复盘推文】")
    for i, p in enumerate(pitfall_converters[:5], 1):
        text_preview = p.get("text", "").replace("\n", " ")[:70]
        print(f"#{i} [{p.get('date')}] 新增关注: +{p.get('new_follows')} 人 | 收藏: {p.get('bookmarks')} | 曝光: {p.get('impressions'):,}")
        print(f"   阶段: {p.get('follower_stage')} | 藏赞比: {p.get('bookmark_like_ratio')}")
        print(f"   正文: \"{text_preview}...\"")
        print(f"   链接: {p.get('link')}\n")

    # 踩坑帖中藏赞比最高的（案头备查避坑指南）
    pitfall_assets = [p for p in pitfall_converters if p.get("likes", 0) >= 30]
    pitfall_assets.sort(key=lambda x: x.get("bookmark_like_ratio", 0), reverse=True)

    print("📚 【藏赞比最高的 Top 5 避坑手册帖（读者当作案头指南收藏）】")
    for i, p in enumerate(pitfall_assets[:5], 1):
        text_preview = p.get("text", "").replace("\n", " ")[:70]
        print(f"#{i} [{p.get('date')}] 藏赞比: {p.get('bookmark_like_ratio')} | 收藏: {p.get('bookmarks')} | 点赞: {p.get('likes')}")
        print(f"   阶段: {p.get('follower_stage')} | 曝光: {p.get('impressions'):,}")
        print(f"   正文: \"{text_preview}...\"")
        print(f"   链接: {p.get('link')}\n")


if __name__ == "__main__":
    main()
