#!/usr/bin/env python3
"""
open-x-analytics · Automated Incremental Sync Tool
===================================================
Merges new official X Analytics CSV exports into the open dataset:
1. Deduplicates and upserts daily overview metrics by Date.
2. Deduplicates and upserts post content metrics by Post id.
3. Automatically regenerates data/jsonl/posts.jsonl with typed fields.
4. Reports total dataset stats for commit logs.

Usage:
  python3 scripts/sync.py --content ~/Downloads/account_analytics_content_*.csv --overview ~/Downloads/account_overview_analytics.csv
"""

import os
import sys
import csv
import json
import argparse
from datetime import datetime

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_DIR = os.path.join(REPO_ROOT, "data", "csv")
JSONL_DIR = os.path.join(REPO_ROOT, "data", "jsonl")

OVERVIEW_FILE = os.path.join(CSV_DIR, "daily_overview.csv")
VERIFIED_FILE = os.path.join(CSV_DIR, "daily_overview_verified.csv")
CONTENT_FILE = os.path.join(CSV_DIR, "posts_content.csv")
JSONL_FILE = os.path.join(JSONL_DIR, "posts.jsonl")


def parse_date(date_str):
    # Formats like "Mon, Oct 12, 2026"
    for fmt in ("%a, %b %d, %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            pass
    return datetime.min


def merge_overview(canonical_path, new_path):
    if not os.path.exists(new_path):
        print(f"[-] Overview source file not found: {new_path}")
        return

    existing_rows = {}
    fieldnames = None

    if os.path.exists(canonical_path):
        with open(canonical_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                existing_rows[row["Date"].strip()] = row

    with open(new_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not fieldnames:
            fieldnames = reader.fieldnames
        new_count = 0
        updated_count = 0
        for row in reader:
            d = row["Date"].strip()
            if d not in existing_rows:
                new_count += 1
            else:
                updated_count += 1
            existing_rows[d] = row

    # Sort rows by Date descending (latest first)
    sorted_rows = sorted(existing_rows.values(), key=lambda x: parse_date(x["Date"]), reverse=True)

    with open(canonical_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(sorted_rows)

    print(f"[+] Synced {os.path.basename(canonical_path)}: {len(sorted_rows)} total days (+{new_count} new, ~{updated_count} updated).")


def merge_content(canonical_path, new_path):
    if not os.path.exists(new_path):
        print(f"[-] Content source file not found: {new_path}")
        return

    existing_rows = {}
    fieldnames = None

    if os.path.exists(canonical_path):
        with open(canonical_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                existing_rows[row["Post id"].strip()] = row

    with open(new_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not fieldnames:
            fieldnames = reader.fieldnames
        new_count = 0
        updated_count = 0
        for row in reader:
            pid = row["Post id"].strip()
            if pid not in existing_rows:
                new_count += 1
            else:
                updated_count += 1
            existing_rows[pid] = row

    # Sort rows by Date descending, then Post id
    sorted_rows = sorted(existing_rows.values(), key=lambda x: (parse_date(x.get("Date", "")), x.get("Post id", "")), reverse=True)

    with open(canonical_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(sorted_rows)

    print(f"[+] Synced {os.path.basename(canonical_path)}: {len(sorted_rows)} total posts (+{new_count} new, ~{updated_count} updated).")
    regenerate_jsonl(canonical_path, JSONL_FILE)


def regenerate_jsonl(csv_path, jsonl_path):
    os.makedirs(os.path.dirname(jsonl_path), exist_ok=True)
    count = 0
    with open(csv_path, "r", encoding="utf-8") as f_in, open(jsonl_path, "w", encoding="utf-8") as f_out:
        reader = csv.DictReader(f_in)
        for row in reader:
            item = {
                "post_id": row.get("Post id", "").strip(),
                "date": row.get("Date", "").strip(),
                "text": row.get("Post text", "").strip(),
                "link": row.get("Post Link", "").strip(),
                "is_reply": row.get("Post text", "").strip().startswith("@"),
                "impressions": int(row.get("Impressions", 0) or 0),
                "likes": int(row.get("Likes", 0) or 0),
                "bookmarks": int(row.get("Bookmarks", 0) or 0),
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
            }
            item["bookmark_like_ratio"] = round(item["bookmarks"] / item["likes"], 3) if item["likes"] > 0 else 0.0
            f_out.write(json.dumps(item, ensure_ascii=False) + "\n")
            count += 1
    print(f"[+] Regenerated {os.path.basename(jsonl_path)}: {count} records.")


def main():
    parser = argparse.ArgumentParser(description="Sync official X analytics export into open-x-analytics repository")
    parser.add_argument("--overview", help="Path to downloaded account_overview_analytics.csv")
    parser.add_argument("--verified", help="Path to downloaded account_overview_analytics (verified).csv")
    parser.add_argument("--content", help="Path to downloaded account_analytics_content_*.csv")
    args = parser.parse_args()

    if not (args.overview or args.verified or args.content):
        parser.print_help()
        sys.exit(1)

    if args.overview:
        merge_overview(OVERVIEW_FILE, args.overview)
    if args.verified:
        merge_overview(VERIFIED_FILE, args.verified)
    if args.content:
        merge_content(CONTENT_FILE, args.content)


if __name__ == "__main__":
    main()
