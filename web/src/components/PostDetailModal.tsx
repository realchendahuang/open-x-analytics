import React, { useEffect, useState } from 'react'
import type { Post } from '../types/analytics'
import { MarkdownRenderer } from './MarkdownRenderer'
import {
  X,
  ExternalLink,
  Bookmark,
  Heart,
  Eye,
  UserPlus,
  Share2,
  MessageCircle,
  MousePointerClick,
  Activity,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react'

interface PostDetailModalProps {
  post: Post | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedText, setCopiedText] = useState(false)

  // Keyboard navigation: Esc to close, ArrowLeft for prev, ArrowRight for next
  useEffect(() => {
    if (!post) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev()
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [post, hasPrev, hasNext, onPrev, onNext, onClose])

  if (!post) return null

  const isLongArticle = post.text.length > 800 || post.text.startsWith('# ')
  const wordCount = post.text.length

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(post.text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/60 overflow-hidden z-10">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Stage Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                post.stage.includes('破冰')
                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                  : post.stage.includes('增长')
                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                  : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
              }`}
            >
              {post.stage}
            </span>

            {/* Type Badges */}
            {isLongArticle && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                <FileText className="h-3 w-3" />
                X Article 深度长文
              </span>
            )}
            {post.is_pitfall && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                踩坑反思
              </span>
            )}
            {post.is_reply ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                互动回复
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                原创主帖
              </span>
            )}

            <span className="text-xs text-slate-500 inline-flex items-center gap-1 ml-1">
              <Calendar className="h-3 w-3" />
              {post.date}
            </span>

            <span className="text-xs text-slate-500 hidden sm:inline">
              · 约 {wordCount.toLocaleString()} 字
            </span>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="复制卡片专属链接"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>

            <a
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition"
            >
              <span>X 原推</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
              title="关闭 (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Post ID & Followers Badge Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-500">Post ID: {post.id}</span>
              {post.followers_at_post > 0 && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                  当时粉丝基数: ~{post.followers_at_post.toLocaleString()}
                </span>
              )}
            </div>

            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
            >
              {copiedText ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">正文已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>复制逐字正文</span>
                </>
              )}
            </button>
          </div>

          {/* Verbatim Text Rendered with Rich Markdown */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-5 sm:p-6 text-slate-100">
            <MarkdownRenderer content={post.text} />
          </div>

          {/* Full Metrics Matrix (全景指标罗盘) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
                全景官方运营指标看板 (Official Metrics)
              </h3>
              {post.bm_like_ratio >= 1.0 && (
                <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  高复用案头手册（藏赞比 ≥ 1.0）
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <Eye className="h-3 w-3 text-blue-400" />
                  <span>累计曝光</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {post.impressions.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <UserPlus className="h-3 w-3 text-emerald-400" />
                  <span>直接增粉</span>
                </div>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  +{post.new_follows}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <Bookmark className="h-3 w-3 text-purple-400" />
                  <span>书签收藏</span>
                </div>
                <div className="text-base font-bold text-purple-300 font-mono">
                  {post.bookmarks.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <Heart className="h-3 w-3 text-rose-400" />
                  <span>点赞喜欢</span>
                </div>
                <div className="text-base font-bold text-slate-200 font-mono">
                  {post.likes.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <TrendingUp className="h-3 w-3 text-indigo-400" />
                  <span>藏赞比</span>
                </div>
                <div className="text-base font-bold text-indigo-300 font-mono">
                  {post.bm_like_ratio.toFixed(2)}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <MousePointerClick className="h-3 w-3 text-amber-400" />
                  <span>外链点击</span>
                </div>
                <div className="text-base font-bold text-amber-300 font-mono">
                  {post.url_clicks.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <MessageCircle className="h-3 w-3 text-sky-400" />
                  <span>回复讨论</span>
                </div>
                <div className="text-base font-bold text-slate-200 font-mono">
                  {post.replies.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <Share2 className="h-3 w-3 text-teal-400" />
                  <span>转推传播</span>
                </div>
                <div className="text-base font-bold text-slate-200 font-mono">
                  {post.reposts.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <Activity className="h-3 w-3 text-blue-400" />
                  <span>日均曝光</span>
                </div>
                <div className="text-base font-bold text-slate-300 font-mono">
                  {Math.round(post.daily_impressions).toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <UserPlus className="h-3 w-3 text-emerald-400" />
                  <span>日均增粉</span>
                </div>
                <div className="text-base font-bold text-slate-300 font-mono">
                  {post.daily_new_follows.toFixed(1)}
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-3 col-span-2">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>扩散比 (Viral Ratio)</span>
                </div>
                <div className="text-base font-bold text-cyan-300 font-mono">
                  {post.viral_ratio.toFixed(2)}x
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/90 text-xs">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
              hasPrev
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                : 'opacity-40 cursor-not-allowed text-slate-500 border-slate-800'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>上一篇 (←)</span>
          </button>

          <span className="text-slate-500 text-[11px]">
            提示：支持键盘 ← / → 切换推文，Esc 关闭
          </span>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
              hasNext
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                : 'opacity-40 cursor-not-allowed text-slate-500 border-slate-800'
            }`}
          >
            <span>下一篇 (→)</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
