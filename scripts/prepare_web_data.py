#!/usr/bin/env python3
"""
Prepares compressed, clean JSON data for the web frontend dashboard.
Reads:
  - data/jsonl/posts.jsonl
  - data/csv/daily_overview.csv
Outputs:
  - web/public/data/posts.json
  - web/public/data/overview.json
  - web/public/data/summary.json
"""

import json
import csv
import os
import re

PITFALL_KEYWORDS = [
    "踩坑", "避坑", "排查", "翻车", "bug", "Bug", "BUG", 
    "教训", "复盘", "死锁", "重构", "事故", "警惕"
]

def is_pitfall_post(text: str) -> bool:
    if not text:
        return False
    lower = text.lower()
    return any(kw.lower() in lower for kw in PITFALL_KEYWORDS)

def process_posts():
    posts_path = os.path.join(os.path.dirname(__file__), "../data/jsonl/posts.jsonl")
    posts = []
    
    total_impressions = 0
    total_bookmarks = 0
    total_likes = 0
    total_new_follows = 0
    pitfall_count = 0
    
    with open(posts_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            item = json.loads(line)
            
            text = item.get("text", "")
            is_pitfall = is_pitfall_post(text)
            if is_pitfall:
                pitfall_count += 1
                
            impressions = int(item.get("impressions", 0))
            bookmarks = int(item.get("bookmarks", 0))
            likes = int(item.get("likes", 0))
            new_follows = int(item.get("new_follows", 0))
            
            total_impressions += impressions
            total_bookmarks += bookmarks
            total_likes += likes
            total_new_follows += new_follows
            
            post = {
                "id": str(item.get("post_id", "")),
                "date": item.get("date", ""),
                "text": text,
                "link": item.get("link", ""),
                "is_reply": bool(item.get("is_reply", False)),
                "impressions": impressions,
                "likes": likes,
                "bookmarks": bookmarks,
                "new_follows": new_follows,
                "replies": int(item.get("replies", 0)),
                "reposts": int(item.get("reposts", 0)),
                "url_clicks": int(item.get("url_clicks", 0)),
                "bm_like_ratio": round(float(item.get("bookmark_like_ratio", 0.0)), 3),
                "stage": item.get("follower_stage", ""),
                "viral_ratio": round(float(item.get("viral_ratio", 0.0)), 1),
                "followers_at_post": int(item.get("followers_at_post", 0)),
                "daily_impressions": round(float(item.get("daily_impressions", 0.0)), 1),
                "daily_new_follows": round(float(item.get("daily_new_follows", 0.0)), 2),
                "is_pitfall": is_pitfall,
            }
            posts.append(post)
            
    return posts, {
        "total_posts": len(posts),
        "total_impressions": total_impressions,
        "total_bookmarks": total_bookmarks,
        "total_likes": total_likes,
        "total_new_follows": total_new_follows,
        "overall_bm_like_ratio": round(total_bookmarks / max(total_likes, 1), 3),
        "pitfall_count": pitfall_count,
    }

def process_overview():
    csv_path = os.path.join(os.path.dirname(__file__), "../data/csv/daily_overview.csv")
    records = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append({
                "date": row.get("Date", "").strip(),
                "impressions": int(row.get("Impressions", 0) or 0),
                "likes": int(row.get("Likes", 0) or 0),
                "engagements": int(row.get("Engagements", 0) or 0),
                "bookmarks": int(row.get("Bookmarks", 0) or 0),
                "shares": int(row.get("Shares", 0) or 0),
                "new_follows": int(row.get("New follows", 0) or 0),
                "unfollows": int(row.get("Unfollows", 0) or 0),
                "net_follows": int(row.get("New follows", 0) or 0) - int(row.get("Unfollows", 0) or 0),
                "replies": int(row.get("Replies", 0) or 0),
                "reposts": int(row.get("Reposts", 0) or 0),
                "profile_visits": int(row.get("Profile visits", 0) or 0),
                "posts_count": int(row.get("Create Post", 0) or 0),
            })
    # Reverse so it is chronological (oldest to newest)
    records.reverse()
    return records

def main():
    out_dir = os.path.join(os.path.dirname(__file__), "../web/public/data")
    os.makedirs(out_dir, exist_ok=True)
    
    posts, post_summary = process_posts()
    overview = process_overview()
    
    # Calculate overview totals
    ov_impressions = sum(r["impressions"] for r in overview)
    ov_new_follows = sum(r["new_follows"] for r in overview)
    ov_unfollows = sum(r["unfollows"] for r in overview)
    ov_net_follows = ov_new_follows - ov_unfollows
    retention_rate = round((ov_net_follows / max(ov_new_follows, 1)) * 100, 1)
    
    summary = {
        **post_summary,
        "overview_impressions": ov_impressions,
        "overview_new_follows": ov_new_follows,
        "overview_unfollows": ov_unfollows,
        "overview_net_follows": ov_net_follows,
        "retention_rate": retention_rate,
        "main_posts": len([p for p in posts if not p["is_reply"]]),
        "reply_posts": len([p for p in posts if p["is_reply"]]),
        "max_single_follow": max(p["new_follows"] for p in posts),
    }
    
    with open(os.path.join(out_dir, "posts.json"), "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, separators=(',', ':'))
        
    with open(os.path.join(out_dir, "overview.json"), "w", encoding="utf-8") as f:
        json.dump(overview, f, ensure_ascii=False, separators=(',', ':'))
        
    with open(os.path.join(out_dir, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Generated posts.json ({len(posts)} posts, {os.path.getsize(os.path.join(out_dir, 'posts.json')) // 1024} KB)")
    print(f"✅ Generated overview.json ({len(overview)} days, {os.path.getsize(os.path.join(out_dir, 'overview.json')) // 1024} KB)")
    print(f"✅ Generated summary.json")

if __name__ == "__main__":
    main()
