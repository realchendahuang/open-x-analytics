import type { LucideIcon } from 'lucide-react'
import { Bookmark, Eye, Flame, Terminal, TrendingUp, UserPlus } from 'lucide-react'
import type { Summary } from '../types/analytics'
import { formatCompact, formatInt } from '../lib/format'
import { Skeleton } from './Section'

interface Card {
  label: string
  value: string
  subtext: string
  icon: LucideIcon
  border: string
  iconColor: string
  glow: string
}

function buildCards(s: Summary): Card[] {
  return [
    {
      label: '总曝光',
      value: formatCompact(s.overview_impressions),
      subtext: `逐日大盘 ${s.overview_days} 天合计`,
      icon: Eye,
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      glow: 'bg-blue-500/20',
    },
    {
      label: '净增粉丝',
      value: `+${formatInt(s.overview_net_follows)}`,
      subtext: `新增 ${formatInt(s.overview_new_follows)}，取关 ${formatInt(s.overview_unfollows)}，留存 ${s.retention_rate}%`,
      icon: UserPlus,
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      glow: 'bg-emerald-500/20',
    },
    {
      label: '藏赞比',
      value: s.overall_bm_like_ratio.toFixed(2),
      subtext: '收藏数 ÷ 点赞数，全部推文合计',
      icon: Bookmark,
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      glow: 'bg-purple-500/20',
    },
    {
      label: '总收藏',
      value: formatInt(s.total_bookmarks),
      subtext: `推文明细合计，点赞 ${formatInt(s.total_likes)}`,
      icon: TrendingUp,
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      glow: 'bg-amber-500/20',
    },
    {
      label: '单帖增粉纪录',
      value: `+${s.max_single_follow}`,
      subtext: '一条推文直接带来的新关注数',
      icon: Flame,
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400',
      glow: 'bg-rose-500/20',
    },
    {
      label: '踩坑复盘帖',
      value: `${s.pitfall_count} 篇`,
      subtext: `共收录 ${formatInt(s.main_posts)} 篇主帖和 ${formatInt(s.reply_posts)} 篇回复`,
      icon: Terminal,
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      glow: 'bg-cyan-500/20',
    },
  ]
}

const GRID = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3'

export function KPICards({ summary }: { summary: Summary | null }) {
  if (!summary) {
    return (
      <div className={GRID}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[104px]" />
        ))}
      </div>
    )
  }

  return (
    <div className={GRID}>
      {buildCards(summary).map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl bg-slate-900/70 border ${card.border} p-4 shadow-lg shadow-black/20`}
          >
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${card.glow} blur-xl`} aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <Icon className={`h-4 w-4 shrink-0 ${card.iconColor}`} aria-hidden="true" />
            </div>
            <div className="relative text-2xl font-black text-white tracking-tight tabular-nums">{card.value}</div>
            <div className="relative text-[11px] text-slate-400 mt-1 leading-snug">{card.subtext}</div>
          </div>
        )
      })}
    </div>
  )
}
