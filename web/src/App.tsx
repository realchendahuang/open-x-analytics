import { lazy, Suspense } from 'react'
import type { DailyOverview, Post, Summary } from './types/analytics'
import { useJson } from './hooks/useJson'
import { Header } from './components/Header'
import { KPICards } from './components/KPICards'
import { StageComparison } from './components/StageComparison'
import { TweetExplorer } from './components/TweetExplorer'
import { ErrorNotice, Skeleton } from './components/Section'

// 图表依赖 ECharts（体积大），拆成独立 chunk 按需加载，不阻塞首屏
const ScatterMatrix = lazy(() => import('./components/ScatterMatrix'))
const DailyTrendChart = lazy(() => import('./components/DailyTrendChart'))

function SectionLoader({ error, retry, height }: { error: string | null; retry: () => void; height: string }) {
  return error ? <ErrorNotice message={error} onRetry={retry} /> : <Skeleton className={height} />
}

export function App() {
  const summary = useJson<Summary>('summary.json')
  const overview = useJson<DailyOverview[]>('overview.json')
  const posts = useJson<Post[]>('posts.json')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header summary={summary.data} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {summary.error && <ErrorNotice message={summary.error} onRetry={summary.retry} />}
        <KPICards summary={summary.data} />
        <StageComparison summary={summary.data} />

        {posts.data ? (
          <Suspense fallback={<Skeleton className="h-[28rem]" />}>
            <ScatterMatrix posts={posts.data} />
          </Suspense>
        ) : (
          <SectionLoader error={posts.error} retry={posts.retry} height="h-[28rem]" />
        )}

        {overview.data ? (
          <Suspense fallback={<Skeleton className="h-[26rem]" />}>
            <DailyTrendChart overview={overview.data} />
          </Suspense>
        ) : (
          <SectionLoader error={overview.error} retry={overview.retry} height="h-[26rem]" />
        )}

        {posts.data ? (
          <TweetExplorer posts={posts.data} />
        ) : (
          <SectionLoader error={posts.error} retry={posts.retry} height="h-[40rem]" />
        )}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            开源项目{' '}
            <a
              href="https://github.com/realchendahuang/open-x-analytics"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-white underline underline-offset-4 transition"
            >
              open-x-analytics
            </a>{' '}
            · MIT License
          </p>
          <p className="flex items-center gap-3">
            <a href="https://x.com/realchendahuang" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">
              @realchendahuang
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://chendahuang.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
              chendahuang.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
