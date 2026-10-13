import React from 'react'
import { Rocket, Info } from 'lucide-react'

export const StageComparison: React.FC = () => {
  const stages = [
    {
      title: '🌱 破冰期 (0~1K 粉丝)',
      badge: '13.4x 平均穿透',
      badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      borderColor: 'border-teal-500/30',
      bgColor: 'bg-teal-950/20',
      posts: '17 篇 (主帖)',
      avgImpressions: '10,245',
      avgLikes: '45.8',
      avgRatio: '0.467',
      maxViral: '135.3x (Cloudflare 穷鬼套餐)',
      insight: '零私域基数纯靠公域穿透，高密度硬核长推冷启动效率极高。',
    },
    {
      title: '🚀 增长期 (1K~5K 粉丝)',
      badge: '3.3x 平均穿透',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-950/20',
      posts: '477 篇',
      avgImpressions: '10,709',
      avgLikes: '44.1',
      avgRatio: '0.451',
      maxViral: '52.1x',
      insight: 'Agent Harness 与架构踩坑实录引发行业裂变，关注转化速率最高。',
    },
    {
      title: '⚡ 飞轮期 (5K~10K 粉丝)',
      badge: '0.8x 平均穿透',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      borderColor: 'border-indigo-500/30',
      bgColor: 'bg-indigo-950/20',
      posts: '2,108 篇',
      avgImpressions: '5,223',
      avgLikes: '14.7',
      avgRatio: '0.267',
      maxViral: '18.4x',
      insight: '私域基数成型，日常高频高互动形成长尾飞轮效应。',
    },
  ]

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Rocket className="h-4 w-4 text-cyan-400" />
            生命周期三阶段穿透力实证 (Stage Cohort Analysis)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            通过 Viral Ratio（曝光量 / 发帖时粉丝基数）剥离已有粉丝红利，观察纯内容穿透效率
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stages.map((st, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 border ${st.borderColor} ${st.bgColor} flex flex-col justify-between space-y-3`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{st.title}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${st.badgeColor}`}>
                  {st.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{st.insight}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-500 block">篇均曝光</span>
                <span className="text-slate-200 font-semibold">{st.avgImpressions}</span>
              </div>
              <div>
                <span className="text-slate-500 block">平均藏赞比</span>
                <span className="text-purple-300 font-semibold">{st.avgRatio}</span>
              </div>
              <div>
                <span className="text-slate-500 block">样本篇数</span>
                <span className="text-slate-200 font-semibold">{st.posts}</span>
              </div>
              <div>
                <span className="text-slate-500 block">最高爆发倍率</span>
                <span className="text-emerald-300 font-semibold">{st.maxViral}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-blue-300 font-medium">实证核心发现：</strong>
          破冰期的穿透倍率高达 <strong>13.4 倍</strong>，是飞轮期的近 <strong>17 倍</strong>！
          这证实了在冷启动阶段，一篇极致结构化的技术长帖具备跨层级突破推荐算法的极端杠杆能力。
        </p>
      </div>
    </div>
  )
}
