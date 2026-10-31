import { useCallback, useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Bookmark,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  MessageCircle,
  MousePointerClick,
  Share2,
  Sparkles,
  TrendingUp,
  UserPlus,
  X,
} from 'lucide-react'
import type { Post } from '../types/analytics'
import { formatInt } from '../lib/format'
import { STAGES } from '../lib/post'
import { MarkdownRenderer } from './MarkdownRenderer'

interface PostDetailModalProps {
  post: Post | null
  loading?: boolean
  notFound?: boolean
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

interface Metric {
  label: string
  value: string
  icon: LucideIcon
  iconColor: string
  valueColor?: string
  wide?: boolean
}

function buildMetrics(post: Post): Metric[] {
  return [
    { label: '累计曝光', value: formatInt(post.impressions), icon: Eye, iconColor: 'text-blue-400', valueColor: 'text-white' },
    { label: '直接增粉', value: `+${post.new_follows}`, icon: UserPlus, iconColor: 'text-emerald-400', valueColor: 'text-emerald-400' },
    { label: '收藏', value: formatInt(post.bookmarks), icon: Bookmark, iconColor: 'text-purple-400', valueColor: 'text-purple-300' },
    { label: '点赞', value: formatInt(post.likes), icon: Heart, iconColor: 'text-rose-400' },
    { label: '藏赞比', value: post.bm_like_ratio.toFixed(2), icon: TrendingUp, iconColor: 'text-indigo-400', valueColor: 'text-indigo-300' },
    { label: '外链点击', value: formatInt(post.url_clicks), icon: MousePointerClick, iconColor: 'text-amber-400', valueColor: 'text-amber-300' },
    { label: '回复', value: formatInt(post.replies), icon: MessageCircle, iconColor: 'text-sky-400' },
    { label: '转推', value: formatInt(post.reposts), icon: Share2, iconColor: 'text-teal-400' },
    { label: '日均曝光', value: formatInt(Math.round(post.daily_impressions)), icon: Activity, iconColor: 'text-blue-400' },
    { label: '日均增粉', value: post.daily_new_follows.toFixed(1), icon: UserPlus, iconColor: 'text-emerald-400' },
    { label: '穿透倍率', value: `${post.viral_ratio.toFixed(1)}x`, icon: Sparkles, iconColor: 'text-cyan-400', valueColor: 'text-cyan-300', wide: true },
  ]
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(key)
        window.setTimeout(() => setCopied(c => (c === key ? null : c)), 2000)
      },
      () => undefined,
    )
  }, [])
  return { copied, copy }
}

export function PostDetailModal({ post, loading, notFound, onClose, onPrev, onNext }: PostDetailModalProps) {
  const open = post !== null || Boolean(loading) || Boolean(notFound)
  const dialogRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { copied, copy } = useCopy()

  // 打开时锁定页面滚动并把焦点移入弹窗，关闭后还原焦点
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  // 切换到另一篇时回到正文顶部
  const postId = post?.id
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [postId])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev()
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext()
      } else if (e.key === 'Tab' && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, onPrev, onNext])

  if (!open) return null

  const stage = post ? STAGES[post.stage] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={post ? '推文详情' : '推文'}
        tabIndex={-1}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/60 overflow-hidden focus:outline-none"
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2 flex-wrap text-xs min-w-0">
            {post && stage && (
              <>
                <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${stage.badge}`}>
                  {stage.emoji} {stage.label}
                </span>
                {post.is_article && (
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" aria-hidden="true" />
                    长文
                  </span>
                )}
                {post.is_pitfall && (
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    踩坑复盘
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {post.is_reply ? '回复' : '原创主帖'}
                </span>
                <span className="text-slate-500 inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {post.date}
                </span>
                <span className="text-slate-500 hidden sm:inline">· {formatInt(post.text.length)} 字</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {post && (
              <>
                <button
                  onClick={() => copy('link', `${window.location.origin}${window.location.pathname}#post-${post.id}`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="复制本页链接"
                  aria-label="复制本页链接"
                >
                  {copied === 'link' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <a
                  href={post.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition"
                >
                  X 原推
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="关闭 (Esc)"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-6">
          {loading && <p className="py-16 text-center text-sm text-slate-400">正在加载…</p>}
          {notFound && <p className="py-16 text-center text-sm text-slate-400">没有找到这条推文，链接可能已失效。</p>}

          {post && (
            <>
              <div className="flex items-center justify-between gap-3 text-xs text-slate-400 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-slate-500">ID {post.id}</span>
                  {post.followers_at_post > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      发帖时粉丝约 {formatInt(post.followers_at_post)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => copy('text', post.text)}
                  className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  {copied === 'text' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      复制正文
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 sm:p-6">
                <MarkdownRenderer content={post.text} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                    官方运营指标
                  </h3>
                  {post.bm_like_ratio >= 1 && (
                    <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      收藏数不低于点赞数
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {buildMetrics(post).map(m => {
                    const Icon = m.icon
                    return (
                      <div
                        key={m.label}
                        className={`rounded-xl bg-slate-800/40 border border-slate-700/60 p-3 ${m.wide ? 'col-span-2' : ''}`}
                      >
                        <dt className="flex items-center gap-1 text-slate-400 text-[11px] mb-1">
                          <Icon className={`h-3 w-3 ${m.iconColor}`} aria-hidden="true" />
                          {m.label}
                        </dt>
                        <dd className={`text-base font-bold font-mono tabular-nums ${m.valueColor ?? 'text-slate-200'}`}>
                          {m.value}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-slate-800 text-xs">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            上一篇
          </button>
          <span className="text-slate-500 text-[11px] hidden sm:inline">← / → 切换，Esc 关闭</span>
          <button
            onClick={onNext}
            disabled={!onNext}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
          >
            下一篇
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
