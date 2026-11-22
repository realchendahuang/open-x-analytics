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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl sm:p-6">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
            {icon}
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
          )}
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
      className="flex items-center justify-between gap-3 rounded-xl border border-rose-900/60 bg-rose-950/20 p-4 text-sm text-rose-300"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-lg bg-rose-900/40 px-3 py-1 text-xs text-rose-100 transition hover:bg-rose-900/70"
        >
          重试
        </button>
      )}
    </div>
  )
}
