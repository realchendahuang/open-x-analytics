import { useEffect, useRef } from 'react'
import { BarChart, LineChart, ScatterChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { init, use as registerModules } from 'echarts/core'
import type { ECharts, EChartsCoreOption } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

// 只注册用到的图表与组件，避免引入完整的 echarts 包
registerModules([
  BarChart,
  LineChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
])

interface ChartClickParams {
  data?: unknown
}

/**
 * 管理 ECharts 实例的完整生命周期：创建、随容器尺寸自适应、卸载时销毁。
 * onClick 通过 ref 取最新回调，回调变化不会触发重绘。
 */
export function useECharts(option: EChartsCoreOption | null, onClick?: (params: ChartClickParams) => void) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ECharts | null>(null)
  const clickRef = useRef(onClick)

  useEffect(() => {
    clickRef.current = onClick
  }, [onClick])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const chart = init(container)
    chartRef.current = chart
    chart.on('click', params => clickRef.current?.(params as ChartClickParams))

    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(container)

    return () => {
      observer.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (option) chartRef.current?.setOption(option, { notMerge: true })
  }, [option])

  return containerRef
}
