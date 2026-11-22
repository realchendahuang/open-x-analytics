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
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatInt } from '../lib/format'
import { STAGES } from '../lib/post'
import type { Post } from '../types/analytics'
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
    {
      label: '累计曝光',
      value: formatInt(post.impressions),
      icon: Eye,
      iconColor: 'text-blue-400',
      valueColor: 'text-white',
    },
    {
      label: '新增关注',
      value: `+${post.new_follows}`,
      icon: UserPlus,
      iconColor: 'text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    {
      label: '收藏',
      value: formatInt(post.bookmarks),
      icon: Bookmark,
      iconColor: 'text-purple-400',
      valueColor: 'text-purple-300',
    },
    { label: '点赞', value: formatInt(post.likes), icon: Heart, iconColor: 'text-rose-400' },
    {
      label: '藏赞比',
      value: post.bm_like_ratio.toFixed(2),
      icon: TrendingUp,
      iconColor: 'text-indigo-400',
      valueColor: 'text-indigo-300',
    },
    {
      label: '链接点击',
      value: formatInt(post.url_clicks),
      icon: MousePointerClick,
      iconColor: 'text-amber-400',
      valueColor: 'text-amber-300',
    },
    {
      label: '回复',
      value: formatInt(post.replies),
      icon: MessageCircle,
      iconColor: 'text-sky-400',
    },
    { label: '转推', value: formatInt(post.reposts), icon: Share2, iconColor: 'text-teal-400' },
    {
      label: '日均曝光',
      value: formatInt(Math.round(post.daily_impressions)),
      icon: Activity,
      iconColor: 'text-blue-400',
    },
    {
      label: '日均新增关注',
      value: post.daily_new_follows.toFixed(1),
      icon: UserPlus,
      iconColor: 'text-emerald-400',
    },
    {
      label: '穿透倍率',
      value: `${post.viral_ratio.toFixed(1)}x`,
      icon: Sparkles,
      iconColor: 'text-cyan-400',
      valueColor: 'text-cyan-300',
      wide: true,
    },
  ]
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(key)
        window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000)
      },
      () => undefined,
    )
  }, [])
  return { copied, copy }
}

export function PostDetailModal({
  post,
  loading,
  notFound,
  onClose,
  onPrev,
  onNext,
}: PostDetailModalProps) {
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
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === dialogRef.current)
        ) {
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
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={post ? '推文详情' : '推文'}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/60 focus:outline-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
            {post && stage && (
              <>
                <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${stage.badge}`}>
                  {stage.emoji} {stage.label}
                </span>
                {post.is_article && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2 py-0.5 font-semibold text-indigo-300">
                    <FileText className="h-3 w-3" aria-hidden="true" />
                    长文
                  </span>
                )}
                {post.is_pitfall && (
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-300">
                    踩坑复盘
                  </span>
                )}
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-300">
                  {post.is_reply ? '回复' : '原创主帖'}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {post.date}
                </span>
                <span className="hidden text-slate-500 sm:inline">
                  · {formatInt(post.text.length)} 字
                </span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {post && (
              <>
                <button
                  onClick={() =>
                    copy(
                      'link',
                      `${window.location.origin}${window.location.pathname}#post-${post.id}`,
                    )
                  }
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  title="复制本页链接"
                  aria-label="复制本页链接"
                >
                  {copied === 'link' ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <a
                  href={post.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-2.5 py-1 text-xs font-medium text-blue-300 transition hover:bg-blue-600/30"
                >
                  X 原推
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="关闭 (Esc)"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-5">
          {loading && <p className="py-16 text-center text-sm text-slate-400">正在加载…</p>}
          {notFound && (
            <p className="py-16 text-center text-sm text-slate-400">
              没有找到这条推文，链接可能有误。
            </p>
          )}

          {post && (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3 text-xs text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-slate-500">ID {post.id}</span>
                  {post.followers_at_post > 0 && (
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                      发帖时约 {formatInt(post.followers_at_post)} 粉丝（估算）
                    </span>
                  )}
                </div>
                <button
                  onClick={() => copy('text', post.text)}
                  className="inline-flex shrink-0 items-center gap-1 text-[11px] whitespace-nowrap text-slate-400 transition hover:text-slate-200"
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

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-6">
                <MarkdownRenderer content={post.text} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Activity className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                    X 后台数据
                  </h3>
                  {post.bm_like_ratio >= 1 && (
                    <span className="inline-flex items-center gap-1 rounded border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-300">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      收藏不少于点赞
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                  {buildMetrics(post).map((m) => {
                    const Icon = m.icon
                    return (
                      <div
                        key={m.label}
                        className={`rounded-xl border border-slate-700/60 bg-slate-800/40 p-3 ${m.wide ? 'col-span-2' : ''}`}
                      >
                        <dt className="mb-1 flex items-center gap-1 text-[11px] text-slate-400">
                          <Icon className={`h-3 w-3 ${m.iconColor}`} aria-hidden="true" />
                          {m.label}
                        </dt>
                        <dd
                          className={`font-mono text-base font-bold tabular-nums ${m.valueColor ?? 'text-slate-200'}`}
                        >
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

        <div className="flex items-center justify-between gap-2 border-t border-slate-800 px-4 py-3 text-xs sm:px-5">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            上一篇
          </button>
          <span className="hidden text-[11px] text-slate-500 sm:inline">
            键盘 ← → 切换，Esc 关闭
          </span>
          <button
            onClick={onNext}
            disabled={!onNext}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-800"
          >
            下一篇
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
