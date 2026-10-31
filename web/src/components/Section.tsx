import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function Section({ title, description, icon, actions, children }: SectionProps) {
  return (
    <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            {icon}
            {title}
          </h2>
          {description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-800/50 ${className}`} />
}

interface ErrorNoticeProps {
  message: string
  onRetry?: () => void
}

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-4 text-sm text-rose-300 flex items-center justify-between gap-3"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 px-3 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-rose-100 text-xs transition"
        >
          重试
        </button>
      )}
    </div>
  )
}
