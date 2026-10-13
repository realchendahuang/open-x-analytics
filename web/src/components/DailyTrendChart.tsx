import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { DailyOverview } from '../types/analytics'
import { TrendingUp } from 'lucide-react'

interface DailyTrendChartProps {
  overview: DailyOverview[]
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ overview }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || overview.length === 0) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    const dates = overview.map(o => o.date.replace(/^[A-Za-z]+,\s*/, ''))
    const impressions = overview.map(o => o.impressions)
    const netFollows = overview.map(o => o.net_follows)
    const bookmarks = overview.map(o => o.bookmarks)

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        textStyle: { color: '#f8fafc', fontSize: 12 },
        axisPointer: {
          type: 'cross',
          crossStyle: { color: '#64748b' },
        },
      },
      legend: {
        data: ['净增粉丝', '曝光量', '收藏数'],
        textStyle: { color: '#94a3b8', fontSize: 11 },
        right: '4%',
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '14%',
        top: '12%',
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 18,
          bottom: '2%',
          borderColor: '#334155',
          fillerColor: 'rgba(56, 189, 248, 0.15)',
          textStyle: { color: '#64748b', fontSize: 10 },
        },
      ],
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 30 },
      },
      yAxis: [
        {
          type: 'value',
          name: '净增粉丝 (人)',
          nameTextStyle: { color: '#64748b', fontSize: 10 },
          axisLine: { lineStyle: { color: '#334155' } },
          splitLine: { lineStyle: { color: '#1e293b' } },
          axisLabel: { color: '#94a3b8', fontSize: 10 },
        },
        {
          type: 'value',
          name: '曝光量 (次)',
          nameTextStyle: { color: '#64748b', fontSize: 10 },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: {
            color: '#94a3b8',
            fontSize: 10,
            formatter: (v: number) => (v >= 10000 ? `${(v / 10000).toFixed(0)}w` : v.toString()),
          },
        },
      ],
      series: [
        {
          name: '净增粉丝',
          type: 'bar',
          data: netFollows,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#34d399' },
              { offset: 1, color: '#059669' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: '收藏数',
          type: 'line',
          smooth: true,
          data: bookmarks,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 2 },
          showSymbol: false,
        },
        {
          name: '曝光量',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: impressions,
          itemStyle: { color: '#38bdf8' },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56, 189, 248, 0.25)' },
              { offset: 1, color: 'rgba(56, 189, 248, 0.0)' },
            ]),
          },
          showSymbol: false,
        },
      ],
    }

    chartInstance.current.setOption(option)

    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [overview])

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            逐日大盘增长曲线与曝光趋势 (Daily Dynamics)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            4个月逐日全盘曝光量、净增粉与收藏数演变轨迹（支持底部滑块缩放观察）
          </p>
        </div>
      </div>

      <div ref={chartRef} className="w-full h-80" />
    </div>
  )
}
