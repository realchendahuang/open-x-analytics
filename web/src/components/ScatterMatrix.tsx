import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as echarts from 'echarts'
import type { Post } from '../types/analytics'
import { Layers, ExternalLink } from 'lucide-react'

interface ScatterMatrixProps {
  posts: Post[]
  onSelectPost?: (post: Post) => void
}

export const ScatterMatrix: React.FC<ScatterMatrixProps> = ({ posts, onSelectPost }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  const [stageFilter, setStageFilter] = useState<'all' | 'icebreaker' | 'growth' | 'flywheel'>('all')
  const [pitfallOnly, setPitfallOnly] = useState(false)
  const [activePost, setActivePost] = useState<Post | null>(null)

  // Filter main posts (excluding pure replies for clarity)
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (p.is_reply) return false
      if (stageFilter === 'icebreaker' && !p.stage.includes('破冰')) return false
      if (stageFilter === 'growth' && !p.stage.includes('增长')) return false
      if (stageFilter === 'flywheel' && !p.stage.includes('飞轮')) return false
      if (pitfallOnly && !p.is_pitfall) return false
      return true
    })
  }, [posts, stageFilter, pitfallOnly])

  useEffect(() => {
    if (!chartRef.current) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
      
      chartInstance.current.on('click', (params: any) => {
        if (params.data && params.data[5]) {
          const post = params.data[5] as Post
          setActivePost(post)
          if (onSelectPost) onSelectPost(post)
        }
      })
    }

    const dataPoints = filteredPosts.map(p => [
      p.impressions,
      p.bm_like_ratio,
      p.new_follows,
      p.text.slice(0, 70),
      p.stage,
      p, // raw post object
    ])

    const option: any = {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: any) => {
          const d = params.data
          const post = d[5] as Post
          return `
            <div style="font-weight:600; font-size:12px; color:#38bdf8; margin-bottom:4px;">
              ${post.stage} · ${post.date}
            </div>
            <div style="max-width:280px; font-size:12px; color:#cbd5e1; margin-bottom:8px; line-height:1.4;">
              ${post.text.slice(0, 90)}${post.text.length > 90 ? '...' : ''}
            </div>
            <div style="display:flex; justify-content:space-between; gap:12px; font-size:11px; color:#94a3b8; border-top:1px solid #1e293b; padding-top:6px;">
              <span>曝光: <b style="color:#f8fafc;">${post.impressions.toLocaleString()}</b></span>
              <span>藏赞比: <b style="color:#a855f7;">${post.bm_like_ratio}</b></span>
              <span>直接增粉: <b style="color:#10b981;">+${post.new_follows}</b></span>
            </div>
          `
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '6%',
        containLabel: true,
      },
      xAxis: {
        type: 'log',
        name: '曝光量 (对数轴)',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: '#64748b', fontSize: 11 },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: '藏赞比 (Bookmarks / Likes)',
        nameTextStyle: { color: '#64748b', fontSize: 11 },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
      },
      series: [
        {
          type: 'scatter',
          symbolSize: (val: any) => {
            const nf = val[2]
            return Math.max(Math.min(nf * 0.7 + 6, 32), 6)
          },
          data: dataPoints,
          itemStyle: {
            color: (param: any) => {
              const post = param.data[5] as Post
              if (post.is_pitfall) return '#f43f5e' // Rose for pitfalls
              if (post.stage.includes('破冰')) return '#2dd4bf' // Teal
              if (post.stage.includes('增长')) return '#60a5fa' // Blue
              return '#a78bfa' // Purple
            },
            opacity: 0.8,
            borderColor: '#ffffff22',
            borderWidth: 1,
          },
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
  }, [filteredPosts, onSelectPost])

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              推文资产分布矩阵 (藏赞比 vs 曝光量)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            气泡大小 = 单推带粉数 ｜ 右上角为破圈案头帖，左上方为高净值避坑手册 (点击气泡查看原文)
          </p>
        </div>

        {/* 筛选控制器 */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700">
            <button
              onClick={() => setStageFilter('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                stageFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              全部阶段
            </button>
            <button
              onClick={() => setStageFilter('icebreaker')}
              className={`px-2.5 py-1 rounded-md transition ${
                stageFilter === 'icebreaker' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌱 破冰期
            </button>
            <button
              onClick={() => setStageFilter('growth')}
              className={`px-2.5 py-1 rounded-md transition ${
                stageFilter === 'growth' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🚀 增长期
            </button>
            <button
              onClick={() => setStageFilter('flywheel')}
              className={`px-2.5 py-1 rounded-md transition ${
                stageFilter === 'flywheel' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ 飞轮期
            </button>
          </div>

          <button
            onClick={() => setPitfallOnly(!pitfallOnly)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
              pitfallOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            仅看技术踩坑帖
          </button>
        </div>
      </div>

      <div ref={chartRef} className="w-full h-84" />

      {activePost && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">
                {activePost.stage}
              </span>
              <span className="text-slate-400">{activePost.date}</span>
              <span className="text-emerald-400 font-semibold">+{activePost.new_follows} 关注</span>
              <span className="text-purple-400 font-semibold">{activePost.bm_like_ratio} 藏赞比</span>
              <span className="text-slate-300">{activePost.impressions.toLocaleString()} 曝光</span>
            </div>
            <p className="text-slate-200 line-clamp-2">{activePost.text}</p>
          </div>
          <a
            href={activePost.link}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium inline-flex items-center gap-1.5 transition"
          >
            直达 X 原推
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  )
}
