import { memo } from 'react'
import { Bookmark, ExternalLink, Eye, FileText } from 'lucide-react'
import type { Post } from '../types/analytics'
import { formatCompact, formatInt, snippet } from '../lib/format'
import { STAGES } from '../lib/post'
import { openPost } from '../lib/postHash'

export const PostCard = memo(function PostCard({ post }: { post: Post }) {
  const stage = STAGES[post.stage]
  return (
    <article className="group relative flex flex-col justify-between min-w-0 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 hover:border-indigo-500/70 p-4 transition focus-within:border-indigo-400">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full font-medium border ${stage.badge}`}>
              {stage.emoji} {stage.label}
            </span>
            {post.is_article && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold inline-flex items-center gap-0.5">
                <FileText className="h-2.5 w-2.5" aria-hidden="true" />
                长文
              </span>
            )}
            {post.is_pitfall && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                踩坑
              </span>
            )}
            {post.is_reply && <span className="px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300">回复</span>}
          </div>
          <time dateTime={post.date} className="text-slate-500 font-mono shrink-0">
            {post.date}
          </time>
        </div>

        <button
          onClick={() => openPost(post.id)}
          className="block w-full text-left text-sm text-slate-200 group-hover:text-white leading-relaxed line-clamp-4 [overflow-wrap:anywhere] after:absolute after:inset-0 after:content-[''] focus:outline-none"
          aria-label={`查看推文：${snippet(post.text, 30)}`}
        >
          {snippet(post.text, 240)}
        </button>

        {post.text.length > 300 && (
          <div className="mt-2 text-[11px] text-slate-500">全文约 {formatInt(post.text.length)} 字</div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-semibold tabular-nums" title="单帖直接增粉">
            +{post.new_follows} 粉
          </span>
          <span className="inline-flex items-center gap-1 text-purple-300 font-semibold tabular-nums" title="藏赞比">
            <Bookmark className="h-3 w-3 text-purple-400" aria-hidden="true" />
            {post.bm_like_ratio.toFixed(2)}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400 tabular-nums" title="累计曝光">
            <Eye className="h-3 w-3 text-slate-500" aria-hidden="true" />
            {formatCompact(post.impressions)}
          </span>
        </div>

        <a
          href={post.link}
          target="_blank"
          rel="noreferrer"
          className="relative z-10 p-1 -m-1 text-slate-500 hover:text-blue-400 transition"
          title="在 X 打开原帖"
          aria-label="在 X 打开原帖"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  )
})
