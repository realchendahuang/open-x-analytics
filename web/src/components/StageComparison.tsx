import { Info, Rocket } from 'lucide-react'
import type { Summary } from '../types/analytics'
import { formatInt } from '../lib/format'
import { STAGES } from '../lib/post'
import { openPost } from '../lib/postHash'
import { Section, Skeleton } from './Section'

function Metric({ label, value, tone = 'text-slate-100' }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="text-slate-500 text-[11px]">{label}</dt>
      <dd className={`font-semibold tabular-nums ${tone}`}>{value}</dd>
    </div>
  )
}

export function StageComparison({ summary }: { summary: Summary | null }) {
  return (
    <Section
      title="三个成长阶段的内容表现"
      icon={<Rocket className="h-4 w-4 text-cyan-400" aria-hidden="true" />}
      description={
        <>
          按发帖时的粉丝基数分段，仅统计原创主帖。穿透倍率 = 曝光量 ÷ 发帖时粉丝数，用来扣除已有粉丝带来的基础流量。
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!summary
          ? [0, 1, 2].map(i => <Skeleton key={i} className="h-52" />)
          : summary.stages.map(stat => {
              const meta = STAGES[stat.key]
              return (
                <div key={stat.key} className={`rounded-xl p-4 border ${meta.card} space-y-3`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-white">
                        {meta.emoji} {meta.label}
                      </div>
                      <div className="text-[11px] text-slate-400">{meta.range}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border tabular-nums ${meta.badge}`}>
                      平均穿透 {stat.avg_viral_ratio}x
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3 border-t border-slate-800/80 text-xs">
                    <Metric label="主帖数" value={`${formatInt(stat.count)} 篇`} />
                    <Metric label="篇均曝光" value={formatInt(stat.avg_impressions)} />
                    <Metric label="篇均点赞" value={stat.avg_likes.toFixed(1)} />
                    <Metric label="藏赞比" value={stat.bm_like_ratio.toFixed(2)} tone="text-purple-300" />
                  </dl>

                  <div className="pt-3 border-t border-slate-800/80 text-xs">
                    <div className="text-slate-500 text-[11px]">最高穿透</div>
                    <button
                      onClick={() => openPost(stat.max_viral_post_id)}
                      className="mt-0.5 w-full text-left text-emerald-300 hover:text-emerald-200 transition"
                    >
                      <span className="font-semibold tabular-nums">{stat.max_viral_ratio}x</span>
                      <span className="text-slate-400"> · {stat.max_viral_snippet}…</span>
                    </button>
                  </div>
                </div>
              )
            })}
      </div>

      <p className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          发帖时粉丝数由逐日净增粉倒推，是估算值。均值会被少数爆款拉高，判断单条内容的表现请回到下方列表看具体数据。
        </span>
      </p>
    </Section>
  )
}
