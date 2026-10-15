import { useAnalyticsData } from './hooks/useAnalyticsData'
import { Header } from './components/Header'
import { KPICards } from './components/KPICards'
import { ScatterMatrix } from './components/ScatterMatrix'
import { StageComparison } from './components/StageComparison'
import { DailyTrendChart } from './components/DailyTrendChart'
import { TweetExplorer } from './components/TweetExplorer'
import { Loader2 } from 'lucide-react'

export function App() {
  const { posts, overview, summary, loading, error } = useAnalyticsData()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">正在加载全量数据分析资产...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-400 p-4">
        <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-rose-900/50 text-center space-y-3">
          <p className="font-bold text-lg">数据加载失败</p>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        totalPosts={summary?.total_posts}
        netFollows={summary?.overview_net_follows}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI 核心指标 */}
        <KPICards summary={summary} />

        {/* 推文资产分布矩阵 (散点四象限图) */}
        <ScatterMatrix posts={posts} />

        {/* 生命周期三阶段分析 */}
        <StageComparison />

        {/* 逐日大盘曲线与曝光走势 */}
        <DailyTrendChart overview={overview} />

        {/* 全量推文检索与筛选榜单 */}
        <TweetExplorer posts={posts} />
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>开源项目：</span>
            <a
              href="https://github.com/realchendahuang/open-x-analytics"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition font-medium underline underline-offset-4"
            >
              open-x-analytics
            </a>
            <span>(MIT License)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com/realchendahuang"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition"
            >
              作者 @realchendahuang
            </a>
            <span>•</span>
            <a
              href="https://chendahuang.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              chendahuang.com
            </a>
            <span>•</span>
            <span>GitHub Pages Hosted</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
