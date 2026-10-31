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
      title="不同粉丝量级下，内容表现有什么不同"
      icon={<Rocket className="h-4 w-4 text-cyan-400" aria-hidden="true" />}
      description={
        <>
          按发帖时的粉丝数分成三段，只统计有曝光数据的原创主帖。穿透倍率 = 曝光量 ÷ 发帖时粉丝数，用来扣掉粉丝基数带来的流量差异。
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
                      平均 {stat.avg_viral_ratio} 倍
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3 border-t border-slate-800/80 text-xs">
                    <Metric label="样本" value={`${formatInt(stat.count)} 篇主帖`} />
                    <Metric label="穿透倍率中位数" value={`${stat.median_viral_ratio} 倍`} />
                    <Metric label="平均曝光" value={formatInt(stat.avg_impressions)} />
                    <Metric label="平均点赞" value={stat.avg_likes.toFixed(1)} />
                    <Metric label="藏赞比" value={stat.bm_like_ratio.toFixed(2)} tone="text-purple-300" />
                  </dl>

                  <div className="pt-3 border-t border-slate-800/80 text-xs">
                    <div className="text-slate-500 text-[11px]">穿透倍率最高的一条</div>
                    <button
                      onClick={() => openPost(stat.max_viral_post_id)}
                      className="mt-0.5 w-full text-left text-emerald-300 hover:text-emerald-200 transition"
                    >
                      <span className="font-semibold tabular-nums">{stat.max_viral_ratio} 倍</span>
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
          平均数被少数爆款拉得很高，中位数才是一条普通推文的水平：三个阶段的中位数都低于 1 倍，也就是大多数推文的曝光没有超过当时的粉丝数。发帖时的粉丝数由逐日净增粉倒推，是估算值。破冰期样本只有十几篇，参考意义有限。
        </span>
      </p>
    </Section>
  )
}
