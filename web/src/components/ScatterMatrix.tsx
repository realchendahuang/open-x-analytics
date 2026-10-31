import { useMemo, useState } from 'react'
import { Layers } from 'lucide-react'
import type { EChartsCoreOption } from 'echarts/core'
import type { Post, StageKey } from '../types/analytics'
import { useECharts } from '../hooks/useECharts'
import { escapeHtml, formatInt, snippet } from '../lib/format'
import { PITFALL_COLOR, STAGES, STAGE_ORDER } from '../lib/post'
import { openPost } from '../lib/postHash'
import { Section } from './Section'

type StageFilter = StageKey | 'all'

// 散点数据的列顺序：[曝光, 藏赞比, 增粉, 推文 id]
type Point = [number, number, number, string]

const AXIS_TEXT = { color: '#94a3b8', fontSize: 11 }
const AXIS_NAME = { color: '#94a3b8', fontSize: 12 }

function colorOf(post: Post): string {
  return post.is_pitfall ? PITFALL_COLOR : STAGES[post.stage].color
}

export default function ScatterMatrix({ posts }: { posts: Post[] }) {
  const [stage, setStage] = useState<StageFilter>('all')
  const [pitfallOnly, setPitfallOnly] = useState(false)

  const filtered = useMemo(
    () => posts.filter(p => (stage === 'all' || p.stage === stage) && (!pitfallOnly || p.is_pitfall)),
    [posts, stage, pitfallOnly],
  )
  // 对数轴无法表示 0，曝光为 0 的帖子不画，但在图例里说明数量
  const visible = useMemo(() => filtered.filter(p => p.impressions > 0), [filtered])
  const hidden = filtered.length - visible.length

  const option = useMemo<EChartsCoreOption>(() => {
    const byId = new Map(visible.map(p => [p.id, p]))
    const data = visible.map(p => ({
      value: [p.impressions, p.bm_like_ratio, p.new_follows, p.id] satisfies Point,
      itemStyle: { color: colorOf(p) },
    }))

    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        confine: true,
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: { value: Point }) => {
          const post = byId.get(params.value[3])
          if (!post) return ''
          const meta = STAGES[post.stage]
          return `
            <div style="max-width:280px;white-space:normal">
              <div style="color:#38bdf8;font-weight:600;margin-bottom:4px">${meta.emoji} ${meta.label} · ${escapeHtml(post.date)}</div>
              <div style="color:#cbd5e1;line-height:1.5;margin-bottom:8px">${escapeHtml(snippet(post.text, 90))}</div>
              <div style="color:#94a3b8;border-top:1px solid #1e293b;padding-top:6px">
                曝光 <b style="color:#f8fafc">${formatInt(post.impressions)}</b> ·
                藏赞比 <b style="color:#c084fc">${post.bm_like_ratio.toFixed(2)}</b> ·
                增粉 <b style="color:#34d399">+${post.new_follows}</b>
              </div>
              <div style="color:#64748b;font-size:11px;margin-top:4px">点击查看全文</div>
            </div>`
        },
      },
      grid: { left: 12, right: 24, top: 16, bottom: 8, containLabel: true },
      xAxis: {
        type: 'log',
        name: '累计曝光（对数轴）',
        nameLocation: 'middle',
        nameGap: 32,
        nameTextStyle: AXIS_NAME,
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { ...AXIS_TEXT, formatter: (v: number) => (v >= 10000 ? `${v / 10000} 万` : String(v)) },
      },
      yAxis: {
        type: 'value',
        name: '藏赞比',
        nameLocation: 'end',
        nameTextStyle: { ...AXIS_NAME, align: 'left' },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: AXIS_TEXT,
      },
      series: [
        {
          type: 'scatter',
          data,
          symbolSize: (value: Point) => Math.min(6 + Math.sqrt(value[2]) * 2.2, 34),
          itemStyle: { opacity: 0.78, borderColor: 'rgba(255,255,255,0.25)', borderWidth: 1 },
          emphasis: { focus: 'self', itemStyle: { opacity: 1, borderColor: '#fff' } },
        },
      ],
    }
  }, [visible])

  const containerRef = useECharts(option, params => {
    const value = (params.data as { value?: Point } | undefined)?.value
    if (value) openPost(value[3])
  })

  return (
    <Section
      title="推文资产分布：藏赞比 × 曝光"
      icon={<Layers className="h-4 w-4 text-indigo-400" aria-hidden="true" />}
      description="每个点是一篇原创主帖，点越大单帖增粉越多。越靠上越像「收藏备查」型内容，越靠右传播越广。点击任意一点查看全文。"
      actions={
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div role="group" aria-label="成长阶段" className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700">
            <button
              aria-pressed={stage === 'all'}
              onClick={() => setStage('all')}
              className={`px-2.5 py-1 rounded-md transition ${stage === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              全部
            </button>
            {STAGE_ORDER.map(key => (
              <button
                key={key}
                aria-pressed={stage === key}
                onClick={() => setStage(key)}
                className={`px-2.5 py-1 rounded-md transition ${stage === key ? `${STAGES[key].active} font-semibold` : 'text-slate-400 hover:text-white'}`}
              >
                {STAGES[key].emoji} {STAGES[key].label}
              </button>
            ))}
          </div>
          <button
            aria-pressed={pitfallOnly}
            onClick={() => setPitfallOnly(v => !v)}
            className={`px-2.5 py-1.5 rounded-lg border font-medium transition ${
              pitfallOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            仅看踩坑复盘
          </button>
        </div>
      }
    >
      <ul className="flex items-center gap-x-4 gap-y-1 flex-wrap mb-2 text-[11px] text-slate-400" aria-label="图例">
        {STAGE_ORDER.map(key => (
          <li key={key} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STAGES[key].color }} aria-hidden="true" />
            {STAGES[key].label}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: PITFALL_COLOR }} aria-hidden="true" />
          踩坑复盘（覆盖阶段色）
        </li>
        <li className="ml-auto tabular-nums" title="X 后台没有导出这些帖子的曝光数据（多为回填的历史内容），对数轴无法表示 0">
          {formatInt(visible.length)} 个点
          {hidden > 0 && ` · 另有 ${formatInt(hidden)} 篇无曝光数据未显示`}
        </li>
      </ul>
      <div ref={containerRef} className="w-full h-80 sm:h-96" role="img" aria-label="藏赞比与曝光量的散点图" />
    </Section>
  )
}
