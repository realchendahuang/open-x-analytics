#!/usr/bin/env python3
"""
open-x-analytics · 全量推文截断深度无损修复脚本
=============================================
通过 SocialData / X API 真实抓取所有截断候选推文的完整 full_text，
彻底消除 140 / 280 / 1500 字截断及未闭合推文。
同步修复：
1. /Users/kim/code/solo-life-os-vault/workspace/004-posts/x/
2. /Users/kim/code/open-x-analytics/data/csv/posts_content.csv
3. /Users/kim/code/open-x-analytics/data/jsonl/posts.jsonl
"""

import csv
import json
import re
import subprocess
import sys
from pathlib import Path

VAULT_DIR = Path("/Users/kim/code/solo-life-os-vault")
VAULT_POSTS = VAULT_DIR / "workspace" / "004-posts" / "x"
FETCH_SCRIPT = VAULT_DIR / ".agents/skills/x-operations/scripts" / "fetch_tweet.py"

ANALYTICS_DIR = Path("/Users/kim/code/open-x-analytics")
CSV_PATH = ANALYTICS_DIR / "data" / "csv" / "posts_content.csv"
JSONL_PATH = ANALYTICS_DIR / "data" / "jsonl" / "posts.jsonl"

STATUS_RE = re.compile(r"/status(?:es)?/(\d+)")


def main():
    print("=" * 60)
    print("🚀 开始扫描并修复所有潜在截断推文")
    print("=" * 60)

    with open(JSONL_PATH, "r", encoding="utf-8") as f:
        posts = [json.loads(line) for line in f]

    print(f"[*] 全库推文数: {len(posts)}")

    candidates = []
    for p in posts:
        t = p.get("text", "").strip()
        pid = p["post_id"]
        # 检测潜在截断
        if len(t) == 1500:
            candidates.append(p)
        elif len(t) in [140, 280]:
            candidates.append(p)
        elif len(t) >= 120 and not re.search(
            r"([。！？!?…\.\)\]\n\>~～\—]|https?://\S+|\ud83d[\ud000-\udfff]|\ud83c[\ud000-\udfff]|\ud83e[\ud000-\udfff]|”|』|\)|）)$",
            t,
        ):
            candidates.append(p)

    print(f"[*] 筛选出潜在截断候选: {len(candidates)} 篇")

    upgrades = {}
    for i, c in enumerate(candidates, 1):
        pid = c["post_id"]
        url = f"https://x.com/realchendahuang/status/{pid}"
        cur_len = len(c["text"].strip())
        try:
            res = subprocess.run(
                ["python3", str(FETCH_SCRIPT), "--url", url],
                capture_output=True,
                text=True,
                timeout=20,
            )
            data = json.loads(res.stdout)
            tweet = data.get("tweet", {})
            ft = tweet.get("full_text") or tweet.get("text")
            if ft and len(ft.strip()) > cur_len:
                new_len = len(ft.strip())
                upgrades[pid] = ft.strip()
                print(f"[{i}/{len(candidates)}] ✅ 成功修复 {pid}: {cur_len} -> {new_len} 字符")
            else:
                print(f"[{i}/{len(candidates)}] ➖ 无需更新 {pid} (当前已是完整原文)")
        except Exception as exc:
            print(f"[{i}/{len(candidates)}] ❌ 抓取失败 {pid}: {exc}")

    print("\n" + "=" * 60)
    print(f"🎉 成功从 API 捕获到更长完整正文: {len(upgrades)} 篇")
    print("=" * 60)

    if not upgrades:
        print("[*] 没有需要写回的数据，已全量保持最新。")
        return

    # 1. 写回 Vault Markdown
    updated_vault_count = 0
    for pid, new_text in upgrades.items():
        for md_file in VAULT_POSTS.glob("**/*.md"):
            content = md_file.read_text(encoding="utf-8")
            m = STATUS_RE.search(content)
            if m and m.group(1) == pid:
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    front = parts[1]
                    body = parts[2].strip()
                    sections = re.split(r"(\n##\s+(?:我的批注|数据回采).*)", body, maxsplit=1, flags=re.DOTALL)
                    tail = sections[1] if len(sections) > 1 else ""
                    new_body = f"\n\n{new_text}\n" + (tail if tail else "\n## 我的批注\n\n（待复盘）\n")
                    md_file.write_text(f"---{front}---{new_body}", encoding="utf-8")
                    updated_vault_count += 1
                break

    print(f"[*] 已同步写回 Vault Markdown: {updated_vault_count} 篇")

    # 2. 写回 CSV
    csv_rows = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            pid = row["Post id"].strip()
            if pid in upgrades:
                row["Post text"] = upgrades[pid]
            csv_rows.append(row)

    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_rows)
    print(f"[*] 已同步写回 {CSV_PATH.name}")

    # 3. 写回 JSONL
    new_jsonl_posts = []
    for p in posts:
        pid = p["post_id"]
        if pid in upgrades:
            p["text"] = upgrades[pid]
        new_jsonl_posts.append(p)

    with open(JSONL_PATH, "w", encoding="utf-8") as f:
        for p in new_jsonl_posts:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
    print(f"[*] 已同步写回 {JSONL_PATH.name}")

    print("\n✅ 全量截断修复与双库写回全部完成！")


if __name__ == "__main__":
    main()
