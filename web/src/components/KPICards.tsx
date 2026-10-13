import React from 'react'
import type { Summary } from '../types/analytics'
import { Eye, UserPlus, Bookmark, TrendingUp, Flame, Terminal } from 'lucide-react'

interface KPICardsProps {
  summary: Summary | null
}

export const KPICards: React.FC<KPICardsProps> = ({ summary }) => {
  if (!summary) return null

  const cards = [
    {
      label: '总曝光曝光量 (Impressions)',
      value: (summary.total_impressions / 10000).toFixed(1) + ' 万',
      subtext: `大盘逐日汇总 ${(summary.overview_impressions / 10000).toFixed(1)} 万`,
      icon: Eye,
      accent: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      label: '全期净增粉丝 (Net Follows)',
      value: '+' + summary.overview_net_follows.toLocaleString(),
      subtext: `新增 ${summary.overview_new_follows} ｜ 留存率 ${summary.retention_rate}%`,
      icon: UserPlus,
      accent: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      label: '全盘藏赞比 (Bookmarks / Likes)',
      value: summary.overall_bm_like_ratio.toString(),
      subtext: '远超泛娱乐推文 0.1 ~ 0.2',
      icon: Bookmark,
      accent: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      label: '总收藏数 (Bookmarks)',
      value: summary.total_bookmarks.toLocaleString(),
      subtext: '案头备查手册型技术资产',
      icon: TrendingUp,
      accent: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      label: '单篇推文直接增粉最高',
      value: `+${summary.max_single_follow} 人`,
      subtext: '精准价值交付引发读者关注',
      icon: Flame,
      accent: 'from-rose-500/20 to-rose-600/5',
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400',
    },
    {
      label: '硬核踩坑与 Bug 复盘推文',
      value: `${summary.pitfall_count} 篇`,
      subtext: '架构实战避坑与深度沉淀',
      icon: Terminal,
      accent: 'from-cyan-500/20 to-cyan-600/5',
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl bg-slate-900/70 border ${c.border} p-4 flex flex-col justify-between shadow-lg shadow-black/20 hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${c.accent} blur-xl`} />
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400 tracking-wide line-clamp-1">{c.label}</span>
              <Icon className={`h-4 w-4 shrink-0 ${c.iconColor}`} />
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{c.value}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{c.subtext}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
