#!/usr/bin/env python3
"""
open-x-analytics · Quick Start Demo
====================================
Demonstrates loading and analyzing the dataset using Python standard library.
No third-party packages required!
"""

import os
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSONL_PATH = os.path.join(os.path.dirname(SCRIPT_DIR), "data", "jsonl", "posts.jsonl")


def main():
    if not os.path.exists(JSONL_PATH):
        print(f"Dataset not found at {JSONL_PATH}. Please run scripts/sync.py first.")
        return

    posts = []
    with open(JSONL_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                posts.append(json.loads(line))

    print("=" * 65)
    print("  open-x-analytics · Dataset Overview")
    print("=" * 65)
    total_posts = len(posts)
    total_imp = sum(p["impressions"] for p in posts)
    total_likes = sum(p["likes"] for p in posts)
    total_bm = sum(p["bookmarks"] for p in posts)
    total_follows = sum(p["new_follows"] for p in posts)

    print(f"Total Posts:          {total_posts:,} (Main: {sum(1 for p in posts if not p['is_reply'])}, Replies: {sum(1 for p in posts if p['is_reply'])})")
    print(f"Total Impressions:    {total_imp:,}")
    print(f"Total Bookmarks:      {total_bm:,}")
    print(f"Total Likes:          {total_likes:,}")
    print(f"Bookmark/Like Ratio:  {total_bm / total_likes:.3f}")
    print(f"Direct New Follows:   +{total_follows:,}")

    # Top 5 Asset Posts (BM/Like >= 1.2, Bookmarks >= 200)
    asset_posts = [p for p in posts if not p["is_reply"] and p["likes"] >= 50]
    asset_posts.sort(key=lambda x: x["bookmark_like_ratio"], reverse=True)

    print("\n" + "-" * 65)
    print("  Top 5 Asset Posts (Ranked by Bookmark / Like Ratio, Min 50 Likes)")
    print("-" * 65)
    for i, p in enumerate(asset_posts[:5], 1):
        clean_text = p["text"].replace("\n", " ")[:60]
        print(f"#{i} [{p['date']}] BM/Like: {p['bookmark_like_ratio']} | BM: {p['bookmarks']} | Likes: {p['likes']} | Imp: {p['impressions']:,}")
        print(f"   \"{clean_text}...\"")
        print(f"   URL: {p['link']}")

    # Top 5 Conversion Posts (New Follows)
    conv_posts = [p for p in posts if not p["is_reply"]]
    conv_posts.sort(key=lambda x: x["new_follows"], reverse=True)

    print("\n" + "-" * 65)
    print("  Top 5 Direct Conversion Posts (Ranked by New Follows)")
    print("-" * 65)
    for i, p in enumerate(conv_posts[:5], 1):
        clean_text = p["text"].replace("\n", " ")[:60]
        print(f"#{i} [{p['date']}] Follows: +{p['new_follows']} | Imp: {p['impressions']:,} | BM: {p['bookmarks']} | Likes: {p['likes']}")
        print(f"   \"{clean_text}...\"")
        print(f"   URL: {p['link']}")


if __name__ == "__main__":
    main()
