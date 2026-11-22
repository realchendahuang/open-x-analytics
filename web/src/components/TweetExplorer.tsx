import { ArrowUpDown, Search } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { useJson } from '../hooks/useJson'
import { formatInt } from '../lib/format'
import { FILTERS, SORTS, matchesFilter, mergeById, sortPosts } from '../lib/post'
import type { FilterKey, SortKey } from '../lib/post'
import { closePost, openPost, usePostHash } from '../lib/postHash'
import type { Post } from '../types/analytics'
import { PostCard } from './PostCard'
import { PostDetailModal } from './PostDetailModal'
import { ErrorNotice, Section } from './Section'

const PAGE_SIZE = 24

interface Query {
  search: string
  filter: FilterKey
  sort: SortKey
  includeReplies: boolean
}

export function TweetExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState<Query>({
    search: '',
    filter: 'all',
    sort: 'new_follows',
    includeReplies: false,
  })
  const [limit, setLimit] = useState(PAGE_SIZE)
  const selectedId = usePostHash()

  // 通过链接直达某条回复时，需要把回复数据也加载进来
  const selectedIsMain = selectedId !== null && posts.some((p) => p.id === selectedId)
  const needReplies = query.includeReplies || (selectedId !== null && !selectedIsMain)
  const replies = useJson<Post[]>('replies.json', needReplies)

  const pool = useMemo(
    () => (query.includeReplies && replies.data ? mergeById(posts, replies.data) : posts),
    [posts, replies.data, query.includeReplies],
  )
  const lowered = useMemo(() => pool.map((p) => ({ post: p, text: p.text.toLowerCase() })), [pool])

  const deferredSearch = useDeferredValue(query.search.trim().toLowerCase())

  const results = useMemo(() => {
    const matched = lowered
      .filter(
        ({ post, text }) =>
          matchesFilter(post, query.filter) &&
          (!deferredSearch || text.includes(deferredSearch) || post.id.includes(deferredSearch)),
      )
      .map(({ post }) => post)
    return sortPosts(matched, query.sort)
  }, [lowered, query.filter, query.sort, deferredSearch])

  const update = (patch: Partial<Query>) => {
    setQuery((q) => ({ ...q, ...patch }))
    setLimit(PAGE_SIZE)
  }

  const selected = useMemo(() => {
    if (!selectedId) return null
    return (
      pool.find((p) => p.id === selectedId) ??
      replies.data?.find((p) => p.id === selectedId) ??
      null
    )
  }, [selectedId, pool, replies.data])

  const index = selected ? results.findIndex((p) => p.id === selected.id) : -1
  const prev = index > 0 ? results[index - 1] : null
  const next = index >= 0 && index < results.length - 1 ? results[index + 1] : null

  const shown = results.slice(0, limit)

  return (
    <Section
      title="查找推文"
      icon={<Search className="h-4 w-4 text-blue-400" aria-hidden="true" />}
      description={
        <>
          找到 <strong className="text-blue-400 tabular-nums">{formatInt(results.length)}</strong>{' '}
          篇。点击卡片可以看全文和完整数据。
        </>
      }
      actions={
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={query.includeReplies}
              onChange={(e) => update({ includeReplies: e.target.checked })}
              className="rounded border-slate-700 bg-slate-800 accent-indigo-500"
            />
            同时显示回复
          </label>
          <label className="inline-flex items-center gap-1.5 text-slate-400">
            <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">排序方式</span>
            <select
              value={query.sort}
              onChange={(e) => update({ sort: e.target.value as SortKey })}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  按{s.label}排序
                </option>
              ))}
            </select>
          </label>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="搜正文或推文 ID，例如 Cloudflare、Agent、变现、踩坑"
            aria-label="搜索推文"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div
          role="group"
          aria-label="内容筛选"
          className="flex flex-wrap items-center gap-2 text-xs"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              title={f.hint}
              aria-pressed={query.filter === f.key}
              onClick={() => update({ filter: f.key })}
              className={`rounded-lg border px-3 py-1.5 transition ${
                query.filter === f.key
                  ? `${f.active} font-semibold text-white`
                  : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {needReplies && replies.loading && <p className="text-xs text-slate-400">正在加载回复…</p>}
        {replies.error && <ErrorNotice message={replies.error} onRetry={replies.retry} />}

        {shown.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            没有找到符合条件的推文。换个关键词，或者去掉筛选再试试。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {shown.length < results.length && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setLimit((n) => n + PAGE_SIZE)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 text-xs font-medium text-white transition hover:bg-slate-700"
            >
              显示更多（已显示 {formatInt(shown.length)} / {formatInt(results.length)}）
            </button>
          </div>
        )}
      </div>

      <PostDetailModal
        post={selected}
        loading={selectedId !== null && selected === null && replies.loading}
        notFound={selectedId !== null && selected === null && !replies.loading}
        onClose={closePost}
        onPrev={prev ? () => openPost(prev.id, { replace: true }) : undefined}
        onNext={next ? () => openPost(next.id, { replace: true }) : undefined}
      />
    </Section>
  )
}
