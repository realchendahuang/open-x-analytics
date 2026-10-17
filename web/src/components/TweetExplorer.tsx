import React, { useState, useMemo, useEffect, useCallback } from 'react'
import type { Post } from '../types/analytics'
import { PostDetailModal } from './PostDetailModal'
import {
  Search,
  ExternalLink,
  Flame,
  Bookmark,
  Bug,
  TrendingUp,
  ArrowUpDown,
  FileText,
  Briefcase,
  Wrench,
  HelpCircle,
  Eye,
  Maximize2,
} from 'lucide-react'

interface TweetExplorerProps {
  posts: Post[]
}

export type FilterTag =
  | 'all'
  | 'articles'
  | 'business'
  | 'tools'
  | 'probes'
  | 'high_bm'
  | 'conversion'
  | 'viral'
  | 'pitfall'

export type SortMode = 'new_follows' | 'bm_ratio' | 'impressions' | 'recent' | 'length'

const BUSINESS_KEYWORDS = [
  '变现',
  '传统企业',
  '数字化',
  '美金',
  '商业',
  '获客',
  '客户',
  '小老板',
  '创业',
  '冷启动',
  '实体',
  '成本',
  '利润',
  '建站',
  'fde',
]

const TOOL_KEYWORDS = [
  '开源',
  'github',
  'esp32',
  'cloudflare',
  '工具',
  '框架',
  '桌面端',
  '白嫖',
  '免费',
  '插件',
  '项目',
  '库',
  'repo',
]

const PROBE_KEYWORDS = [
  '好奇',
  '为什么',
  '怎么',
  '请教',
  '大家',
  '讨论',
  '思考',
  '痛点',
  'agent',
  'claude code',
  'codex',
  '架构',
]

export const TweetExplorer: React.FC<TweetExplorerProps> = ({ posts }) => {
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<FilterTag>('all')
  const [sortMode, setSortMode] = useState<SortMode>('new_follows')
  const [includeReplies, setIncludeReplies] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 12

  // Selected post for modal
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  // URL hash sync: detect #post-<id> on mount or popstate
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#post-')) {
        const id = hash.replace('#post-', '')
        const found = posts.find(p => p.id === id)
        if (found) {
          setSelectedPostId(id)
        }
      }
    }

    handleHashChange()
    window.addEventListener('popstate', handleHashChange)
    return () => window.removeEventListener('popstate', handleHashChange)
  }, [posts])

  const openPostModal = useCallback((post: Post) => {
    setSelectedPostId(post.id)
    window.location.hash = `#post-${post.id}`
  }, [])

  const closePostModal = useCallback(() => {
    setSelectedPostId(null)
    if (window.location.hash.startsWith('#post-')) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  const filteredPosts = useMemo(() => {
    return posts
      .filter(p => {
        if (!includeReplies && p.is_reply) return false

        const textLower = p.text.toLowerCase()

        if (search.trim()) {
          const query = search.toLowerCase()
          if (!textLower.includes(query) && !p.id.includes(query)) return false
        }

        if (filterTag === 'articles') {
          return p.text.length > 800 || p.text.startsWith('# ')
        }

        if (filterTag === 'business') {
          return BUSINESS_KEYWORDS.some(k => textLower.includes(k))
        }

        if (filterTag === 'tools') {
          return TOOL_KEYWORDS.some(k => textLower.includes(k))
        }

        if (filterTag === 'probes') {
          return PROBE_KEYWORDS.some(k => textLower.includes(k))
        }

        if (filterTag === 'pitfall' && !p.is_pitfall) return false
        if (filterTag === 'high_bm' && p.bm_like_ratio < 1.0) return false
        if (filterTag === 'viral' && p.impressions < 50000) return false
        if (filterTag === 'conversion' && p.new_follows < 20) return false

        return true
      })
      .sort((a, b) => {
        if (sortMode === 'new_follows') return b.new_follows - a.new_follows
        if (sortMode === 'bm_ratio') return b.bm_like_ratio - a.bm_like_ratio
        if (sortMode === 'impressions') return b.impressions - a.impressions
        if (sortMode === 'length') return b.text.length - a.text.length
        return 0 // recent is default order in JSON
      })
  }, [posts, search, filterTag, sortMode, includeReplies])

  const displayedPosts = filteredPosts.slice(0, page * pageSize)

  // Current modal post and adjacent post navigation
  const currentPostIndex = useMemo(() => {
    if (!selectedPostId) return -1
    return filteredPosts.findIndex(p => p.id === selectedPostId)
  }, [filteredPosts, selectedPostId])

  const currentPost = useMemo(() => {
    if (currentPostIndex >= 0) return filteredPosts[currentPostIndex]
    if (selectedPostId) return posts.find(p => p.id === selectedPostId) || null
    return null
  }, [filteredPosts, currentPostIndex, selectedPostId, posts])

  const handlePrevPost = useCallback(() => {
    if (currentPostIndex > 0) {
      const prev = filteredPosts[currentPostIndex - 1]
      openPostModal(prev)
    }
  }, [currentPostIndex, filteredPosts, openPostModal])

  const handleNextPost = useCallback(() => {
    if (currentPostIndex >= 0 && currentPostIndex < filteredPosts.length - 1) {
      const next = filteredPosts[currentPostIndex + 1]
      openPostModal(next)
    }
  }, [currentPostIndex, filteredPosts, openPostModal])

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Detail Modal */}
      <PostDetailModal
        post={currentPost}
        onClose={closePostModal}
        onPrev={handlePrevPost}
        onNext={handleNextPost}
        hasPrev={currentPostIndex > 0}
        hasNext={currentPostIndex >= 0 && currentPostIndex < filteredPosts.length - 1}
      />

      {/* Top Title & Sorters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-400" />
            全量推文资产检索与单帖解剖库 (Post Showcase & Explorer)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            匹配到 <strong className="text-blue-400 font-mono">{filteredPosts.length.toLocaleString()}</strong> 篇推文 ｜ 支持点击任意卡片查看<strong>逐字正文、长文排版与全生命周期数据罗盘</strong>
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
              <option value="impressions">👀 累计曝光量 (降序)</option>
              <option value="length">📝 正文字数 (降序)</option>
              <option value="recent">🕒 原始时间排序</option>
            </select>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="搜索推文正文、关键词或 Post ID（例如：ESP32, Cloudflare, Agent, 变现, 踩坑, 架构...）"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
        />
      </div>

      {/* 专属特色分类过滤标签 */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <button
          onClick={() => { setFilterTag('all'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition ${
            filterTag === 'all'
              ? 'bg-indigo-600 text-white font-semibold border-indigo-500 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          全部推文
        </button>

        <button
          onClick={() => { setFilterTag('articles'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
            filterTag === 'articles'
              ? 'bg-blue-600 text-white font-semibold border-blue-500 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          💎 X Articles 深度长文
        </button>

        <button
          onClick={() => { setFilterTag('business'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
            filterTag === 'business'
              ? 'bg-emerald-600 text-white font-semibold border-emerald-500 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          💼 商业实战 / FDE
        </button>

        <button
          onClick={() => { setFilterTag('tools'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
            filterTag === 'tools'
              ? 'bg-cyan-600 text-white font-semibold border-cyan-500 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Wrench className="h-3.5 w-3.5" />
          🛠️ 开源好物 / 工具推荐
        </button>

        <button
          onClick={() => { setFilterTag('probes'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
            filterTag === 'probes'
              ? 'bg-sky-600 text-white font-semibold border-sky-500 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          ❓ 深度技术探针
        </button>

        <button
          onClick={() => { setFilterTag('high_bm'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
            filterTag === 'high_bm'
              ? 'bg-purple-600 text-white font-semibold border-purple-400 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          📚 藏赞比 ≥ 1.0 (案头手册)
        </button>

        <button
          onClick={() => { setFilterTag('conversion'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
            filterTag === 'conversion'
              ? 'bg-amber-600 text-white font-semibold border-amber-400 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          🔥 增粉爆款 (增粉 ≥ 20)
        </button>

        <button
          onClick={() => { setFilterTag('viral'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
            filterTag === 'viral'
              ? 'bg-orange-600 text-white font-semibold border-orange-400 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          📈 曝光 ≥ 50,000
        </button>

        <button
          onClick={() => { setFilterTag('pitfall'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
            filterTag === 'pitfall'
              ? 'bg-rose-500 text-white font-semibold border-rose-400 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Bug className="h-3.5 w-3.5" />
          ⚠️ 踩坑反思
        </button>
      </div>

      {/* 推文卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {displayedPosts.map(post => {
          const isArticle = post.text.length > 800 || post.text.startsWith('# ')
          return (
            <div
              key={post.id}
              onClick={() => openPostModal(post)}
              className="group rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 hover:border-indigo-500/70 p-4 flex flex-col justify-between transition-all duration-150 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 relative"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
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

                    {isArticle && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-0.5">
                        <FileText className="h-2.5 w-2.5" />
                        长文
                      </span>
                    )}

                    {post.is_pitfall && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                        踩坑
                      </span>
                    )}

                    {post.is_reply && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300">
                        回复
                      </span>
                    )}
                  </div>

                  <span className="text-slate-500 font-mono text-[11px]">{post.date}</span>
                </div>

                {/* Text snippet */}
                <p className="text-xs text-slate-200 leading-relaxed line-clamp-4 whitespace-pre-wrap group-hover:text-white transition">
                  {post.text}
                </p>

                {/* Length badge if long */}
                {post.text.length > 300 && (
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                    <span>全文约 {post.text.length.toLocaleString()} 字</span>
                    <span className="text-indigo-400/80 group-hover:text-indigo-300 font-medium ml-auto flex items-center gap-0.5">
                      点击解剖全文 <Maximize2 className="h-2.5 w-2.5" />
                    </span>
                  </div>
                )}
              </div>

              {/* Metrics footer */}
              <div className="pt-3 mt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold" title="直接增粉">
                    <span className="text-[10px]">增粉</span>+{post.new_follows}
                  </span>
                  <span className="flex items-center gap-1 text-purple-300 font-semibold" title="藏赞比">
                    <Bookmark className="h-3 w-3 text-purple-400" />
                    {post.bm_like_ratio.toFixed(2)}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-0.5" title="累计曝光">
                    <Eye className="h-3 w-3 text-slate-500" />
                    {post.impressions >= 10000 ? `${(post.impressions / 10000).toFixed(1)}w` : post.impressions.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openPostModal(post)
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium transition flex items-center gap-0.5"
                  >
                    <span>详情</span>
                    <Maximize2 className="h-3 w-3" />
                  </button>

                  <a
                    href={post.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 hover:text-blue-400 transition"
                    title="在 X 打开原帖"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 加载更多按钮 */}
      {displayedPosts.length < filteredPosts.length && (
        <div className="pt-4 text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 hover:border-slate-600 transition shadow-sm"
          >
            加载更多推文 ({displayedPosts.length} / {filteredPosts.length})
          </button>
        </div>
      )}
    </div>
  )
}
