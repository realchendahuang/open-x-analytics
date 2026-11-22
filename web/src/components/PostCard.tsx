import { Bookmark, ExternalLink, Eye, FileText } from 'lucide-react'
import { memo } from 'react'
import { formatCompact, formatInt, snippet } from '../lib/format'
import { STAGES } from '../lib/post'
import { openPost } from '../lib/postHash'
import type { Post } from '../types/analytics'

export const PostCard = memo(function PostCard({ post }: { post: Post }) {
  const stage = STAGES[post.stage]
  return (
    <article className="group relative flex min-w-0 flex-col justify-between rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 transition focus-within:border-indigo-400 hover:border-indigo-500/70 hover:bg-slate-800/70">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full border px-2 py-0.5 font-medium ${stage.badge}`}>
              {stage.emoji} {stage.label}
            </span>
            {post.is_article && (
              <span className="inline-flex items-center gap-0.5 rounded border border-indigo-500/30 bg-indigo-500/20 px-1.5 py-0.5 font-semibold text-indigo-300">
                <FileText className="h-2.5 w-2.5" aria-hidden="true" />
                长文
              </span>
            )}
            {post.is_pitfall && (
              <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 font-semibold text-rose-400">
                踩坑
              </span>
            )}
            {post.is_reply && (
              <span className="rounded bg-slate-700/80 px-1.5 py-0.5 text-slate-300">回复</span>
            )}
          </div>
          <time dateTime={post.date} className="shrink-0 font-mono text-slate-500">
            {post.date}
          </time>
        </div>

        <button
          onClick={() => openPost(post.id)}
          className="line-clamp-4 block w-full text-left text-sm leading-relaxed [overflow-wrap:anywhere] text-slate-200 group-hover:text-white after:absolute after:inset-0 after:content-[''] focus:outline-none"
          aria-label={`查看推文：${snippet(post.text, 30)}`}
        >
          {snippet(post.text, 240)}
        </button>

        {post.text.length > 300 && (
          <div className="mt-2 text-[11px] text-slate-500">
            全文约 {formatInt(post.text.length)} 字
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-3 text-xs">
        <div className="flex items-center gap-3">
          <span
            className="font-semibold text-emerald-400 tabular-nums"
            title="这条推文直接带来的新关注"
          >
            +{post.new_follows} 关注
          </span>
          <span
            className="inline-flex items-center gap-1 font-semibold text-purple-300 tabular-nums"
            title="藏赞比"
          >
            <Bookmark className="h-3 w-3 text-purple-400" aria-hidden="true" />
            {post.bm_like_ratio.toFixed(2)}
          </span>
          <span
            className="inline-flex items-center gap-1 text-slate-400 tabular-nums"
            title="累计曝光"
          >
            <Eye className="h-3 w-3 text-slate-500" aria-hidden="true" />
            {formatCompact(post.impressions)}
          </span>
        </div>

        <a
          href={post.link}
          target="_blank"
          rel="noreferrer"
          className="relative z-10 -m-1 p-1 text-slate-500 transition hover:text-blue-400"
          title="在 X 打开原帖"
          aria-label="在 X 打开原帖"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  )
})
