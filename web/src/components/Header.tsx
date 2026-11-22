import { Activity, ArrowUpRight } from 'lucide-react'
import { formatInt } from '../lib/format'
import type { Summary } from '../types/analytics'

function GithubIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

export function Header({ summary }: { summary: Summary | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg ring-1 shadow-indigo-500/20 ring-white/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-tight text-white sm:text-xl">
              Open X Analytics
            </h1>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
              <span>一个独立开发者从 0 到 1 万粉丝的完整数据</span>
              <a
                href="https://x.com/realchendahuang"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                @realchendahuang
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {summary && (
            <div className="hidden items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>{formatInt(summary.total_posts)} 篇推文</span>
              <span className="text-slate-600">|</span>
              <span>数据更新到 {summary.data_through}</span>
            </div>
          )}
          <a
            href="https://github.com/realchendahuang/open-x-analytics"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-slate-600 hover:bg-slate-700"
          >
            <GithubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}
