import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import type { EChartsCoreOption } from 'echarts/core'
import type { DailyOverview } from '../types/analytics'
import { useECharts } from '../hooks/useECharts'
import { formatInt } from '../lib/format'
import { Section } from './Section'

const AXIS_TEXT = { color: '#94a3b8', fontSize: 11 }

function gradient(top: string, bottom: string) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: top },
      { offset: 1, color: bottom },
    ],
  }
}

export default function DailyTrendChart({ overview }: { overview: DailyOverview[] }) {
  const option = useMemo<EChartsCoreOption>(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        confine: true,
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        axisPointer: { type: 'cross', crossStyle: { color: '#64748b' } },
        valueFormatter: (v: number) => formatInt(v),
      },
      legend: {
        data: ['净增粉丝', '曝光量', '收藏数'],
        textStyle: { color: '#cbd5e1', fontSize: 12 },
        top: 0,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 14,
        itemHeight: 8,
      },
      grid: { left: 12, right: 12, top: 44, bottom: 52, containLabel: true },
      dataZoom: [
        { type: 'inside' },
        {
          type: 'slider',
          height: 18,
          bottom: 8,
          borderColor: '#334155',
          fillerColor: 'rgba(56,189,248,0.15)',
          textStyle: { color: '#64748b', fontSize: 10 },
        },
      ],
      xAxis: {
        type: 'category',
        data: overview.map(o => o.date),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { ...AXIS_TEXT, formatter: (v: string) => v.slice(5) },
      },
      yAxis: [
        {
          type: 'value',
          name: '净增粉丝（人）、收藏（次）',
          nameTextStyle: { ...AXIS_TEXT, align: 'left' },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#1e293b' } },
          axisLabel: AXIS_TEXT,
        },
        {
          type: 'value',
          name: '曝光量',
          nameTextStyle: { ...AXIS_TEXT, align: 'right' },
          splitLine: { show: false },
          axisLine: { show: false },
          axisLabel: { ...AXIS_TEXT, formatter: (v: number) => (v >= 10000 ? `${v / 10000} 万` : String(v)) },
        },
      ],
      series: [
        {
          name: '净增粉丝',
          type: 'bar',
          data: overview.map(o => o.net_follows),
          itemStyle: { color: gradient('#34d399', '#059669'), borderRadius: [3, 3, 0, 0] },
        },
        {
          name: '收藏数',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: overview.map(o => o.bookmarks),
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 2 },
        },
        {
          name: '曝光量',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          showSymbol: false,
          data: overview.map(o => o.impressions),
          itemStyle: { color: '#38bdf8' },
          lineStyle: { width: 2 },
          areaStyle: { color: gradient('rgba(56,189,248,0.25)', 'rgba(56,189,248,0)') },
        },
      ],
    }),
    [overview],
  )

  const containerRef = useECharts(option)
  const first = overview[0]?.date
  const last = overview[overview.length - 1]?.date
  // 区间内应有的天数减去实际有数据的天数，即 X 后台未导出的缺失天数
  const spanDays = first && last ? Math.round((Date.parse(last) - Date.parse(first)) / 86_400_000) + 1 : 0
  const missingDays = Math.max(spanDays - overview.length, 0)

  return (
    <Section
      title="每天的曝光、收藏和涨粉"
      icon={<TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden="true" />}
      description={`${first ?? ''} 到 ${last ?? ''}，${overview.length} 天有数据${missingDays > 0 ? `，另有 ${missingDays} 天 X 后台没有导出` : ''}。数据来自 X 后台的账号总览，拖动下方滑块可以放大某一段。`}
    >
      <div ref={containerRef} className="w-full h-80 sm:h-96" role="img" aria-label="逐日曝光、收藏与净增粉丝走势图" />
    </Section>
  )
}
