import React, { useState, useMemo } from 'react'
import type { Post } from '../types/analytics'
import {
  Search,
  ExternalLink,
  Flame,
  Bookmark,
  Bug,
  TrendingUp,
  ArrowUpDown,
} from 'lucide-react'

interface TweetExplorerProps {
  posts: Post[]
}

type FilterTag = 'all' | 'pitfall' | 'high_bm' | 'viral' | 'conversion'
type SortMode = 'new_follows' | 'bm_ratio' | 'impressions' | 'recent'

export const TweetExplorer: React.FC<TweetExplorerProps> = ({ posts }) => {
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<FilterTag>('all')
  const [sortMode, setSortMode] = useState<SortMode>('new_follows')
  const [includeReplies, setIncludeReplies] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 12

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (!includeReplies && p.is_reply) return false

      if (search.trim()) {
        const query = search.toLowerCase()
        if (!p.text.toLowerCase().includes(query)) return false
      }

      if (filterTag === 'pitfall' && !p.is_pitfall) return false
      if (filterTag === 'high_bm' && p.bm_like_ratio < 1.0) return false
      if (filterTag === 'viral' && p.impressions < 50000) return false
      if (filterTag === 'conversion' && p.new_follows < 20) return false

      return true
    }).sort((a, b) => {
      if (sortMode === 'new_follows') return b.new_follows - a.new_follows
      if (sortMode === 'bm_ratio') return b.bm_like_ratio - a.bm_like_ratio
      if (sortMode === 'impressions') return b.impressions - a.impressions
      return 0 // recent is default order in JSON
    })
  }, [posts, search, filterTag, sortMode, includeReplies])

  const displayedPosts = filteredPosts.slice(0, page * pageSize)

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-400" />
            推文资产全量检索与转化排行榜 (Tweet Explorer)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            共匹配到 <strong className="text-blue-400">{filteredPosts.length}</strong> 篇推文 ｜ 支持正文关键词与指标交叉过滤
          </p>
        </div>

        {/* 排序选择与回复过滤 */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={includeReplies}
              onChange={e => {
                setIncludeReplies(e.target.checked)
                setPage(1)
              }}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>包含互动回复帖</span>
          </label>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortMode}
              onChange={e => setSortMode(e.target.value as SortMode)}
              className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="new_follows">🔥 单推增粉数 (降序)</option>
              <option value="bm_ratio">📚 藏赞比 (降序)</option>
              <option value="impressions">👀 曝光量 (降序)</option>
              <option value="recent">🕒 原始时间排序</option>
            </select>
          </div>
        </div>
      </div>

      {/* 搜索框与过滤标签 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="搜索推文正文关键词（例如：Cloudflare, Agent, 踩坑, 架构, 死锁...）"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => { setFilterTag('all'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg border transition ${
              filterTag === 'all'
                ? 'bg-indigo-600 text-white font-semibold border-indigo-500'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => { setFilterTag('pitfall'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
              filterTag === 'pitfall'
                ? 'bg-rose-500 text-white font-semibold border-rose-400'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Bug className="h-3.5 w-3.5" />
            硬核踩坑帖
          </button>
          <button
            onClick={() => { setFilterTag('high_bm'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
              filterTag === 'high_bm'
                ? 'bg-purple-600 text-white font-semibold border-purple-400'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            藏赞比 ≥ 1.0 (案头手册)
          </button>
          <button
            onClick={() => { setFilterTag('conversion'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
              filterTag === 'conversion'
                ? 'bg-emerald-600 text-white font-semibold border-emerald-400'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            单推增粉 ≥ 20
          </button>
          <button
            onClick={() => { setFilterTag('viral'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
              filterTag === 'viral'
                ? 'bg-amber-600 text-white font-semibold border-amber-400'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            曝光 ≥ 50,000
          </button>
        </div>
      </div>

      {/* 推文卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
        {displayedPosts.map(post => (
          <div
            key={post.id}
            className="rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 p-4 flex flex-col justify-between transition hover:shadow-lg hover:shadow-black/20"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      post.stage.includes('破冰')
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : post.stage.includes('增长')
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}
                  >
                    {post.stage}
                  </span>
                  {post.is_pitfall && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                      踩坑
                    </span>
                  )}
                  {post.is_reply && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      回复
                    </span>
                  )}
                </div>
                <span className="text-slate-500">{post.date}</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                {post.text}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold" title="直接转化关注">
                  <span className="text-[10px]">增粉</span>+{post.new_follows}
                </span>
                <span className="flex items-center gap-1 text-purple-400 font-semibold" title="藏赞比">
                  <Bookmark className="h-3 w-3" />
                  {post.bm_like_ratio}
                </span>
                <span className="text-slate-400 font-mono text-[11px]" title="累计曝光">
                  {post.impressions >= 10000 ? `${(post.impressions / 10000).toFixed(1)}w` : post.impressions}
                </span>
              </div>

              <a
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
              >
                <span>原推</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 加载更多按钮 */}
      {displayedPosts.length < filteredPosts.length && (
        <div className="pt-4 text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition"
          >
            加载更多推文 ({displayedPosts.length} / {filteredPosts.length})
          </button>
        </div>
      )}
    </div>
  )
}
