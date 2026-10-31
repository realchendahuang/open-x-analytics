import type { Post, StageKey } from '../types/analytics'

interface StageMeta {
  label: string
  emoji: string
  range: string
  /** 徽章 */
  badge: string
  /** 卡片边框与底色 */
  card: string
  /** 图表主色 */
  color: string
  /** 激活态按钮 */
  active: string
}

export const STAGE_ORDER: StageKey[] = ['icebreaker', 'growth', 'flywheel']

export const STAGES: Record<StageKey, StageMeta> = {
  icebreaker: {
    label: '破冰期',
    emoji: '🌱',
    range: '0~1K 粉丝',
    badge: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    card: 'border-teal-500/30 bg-teal-950/20',
    color: '#2dd4bf',
    active: 'bg-teal-600 text-white',
  },
  growth: {
    label: '增长期',
    emoji: '🚀',
    range: '1K~5K 粉丝',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    card: 'border-blue-500/30 bg-blue-950/20',
    color: '#60a5fa',
    active: 'bg-blue-600 text-white',
  },
  flywheel: {
    label: '飞轮期',
    emoji: '⚡',
    range: '5K~10K 粉丝',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    card: 'border-purple-500/30 bg-purple-950/20',
    color: '#a78bfa',
    active: 'bg-purple-600 text-white',
  },
}

export const PITFALL_COLOR = '#f43f5e'

export type FilterKey =
  | 'all'
  | 'articles'
  | 'business'
  | 'tools'
  | 'probes'
  | 'high_bm'
  | 'conversion'
  | 'viral'
  | 'pitfall'

export const FILTERS: { key: FilterKey; label: string; hint?: string; active: string }[] = [
  { key: 'all', label: '全部', active: 'bg-indigo-600 border-indigo-500' },
  { key: 'articles', label: 'X Articles 长文', hint: '正文超过 800 字或以 # 开头', active: 'bg-blue-600 border-blue-500' },
  { key: 'business', label: '商业实战', hint: '变现、获客、创业、成本等关键词', active: 'bg-emerald-600 border-emerald-500' },
  { key: 'tools', label: '开源与工具', hint: '开源、GitHub、插件、Cloudflare 等关键词', active: 'bg-cyan-600 border-cyan-500' },
  { key: 'probes', label: '技术探讨', hint: '提问、讨论、Agent、架构等关键词', active: 'bg-sky-600 border-sky-500' },
  { key: 'high_bm', label: '藏赞比 ≥ 1', hint: '收藏数不低于点赞数的案头手册型内容', active: 'bg-purple-600 border-purple-400' },
  { key: 'conversion', label: '增粉 ≥ 20', hint: '单帖直接带来 20 个以上新关注', active: 'bg-amber-600 border-amber-400' },
  { key: 'viral', label: '曝光 ≥ 5 万', hint: '累计曝光不低于 50,000', active: 'bg-orange-600 border-orange-400' },
  { key: 'pitfall', label: '踩坑复盘', hint: '含踩坑、避坑、排查、复盘等关键词', active: 'bg-rose-500 border-rose-400' },
]

export function matchesFilter(post: Post, filter: FilterKey): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'articles':
      return post.is_article
    case 'business':
    case 'tools':
    case 'probes':
      return post.tags.includes(filter)
    case 'high_bm':
      return post.bm_like_ratio >= 1
    case 'conversion':
      return post.new_follows >= 20
    case 'viral':
      return post.impressions >= 50_000
    case 'pitfall':
      return post.is_pitfall
  }
}

export type SortKey = 'new_follows' | 'bm_like_ratio' | 'impressions' | 'length' | 'recent'

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'new_follows', label: '单帖增粉' },
  { key: 'bm_like_ratio', label: '藏赞比' },
  { key: 'impressions', label: '累计曝光' },
  { key: 'length', label: '正文字数' },
  { key: 'recent', label: '最新发布' },
]

/** 推文 ID 是 19 位雪花 ID，超出 Number 精度，按「长度 → 字典序」比较，结果为新到旧。 */
export function compareIdDesc(a: string, b: string): number {
  if (a.length !== b.length) return b.length - a.length
  return a < b ? 1 : a > b ? -1 : 0
}

export function sortPosts(posts: Post[], sort: SortKey): Post[] {
  const list = posts.slice()
  switch (sort) {
    case 'new_follows':
      return list.sort((a, b) => b.new_follows - a.new_follows || b.impressions - a.impressions)
    case 'bm_like_ratio':
      return list.sort((a, b) => b.bm_like_ratio - a.bm_like_ratio)
    case 'impressions':
      return list.sort((a, b) => b.impressions - a.impressions)
    case 'length':
      return list.sort((a, b) => b.text.length - a.text.length)
    case 'recent':
      return list.sort((a, b) => compareIdDesc(a.id, b.id))
  }
}

export function mergeById(a: Post[], b: Post[]): Post[] {
  return [...a, ...b].sort((x, y) => compareIdDesc(x.id, y.id))
}
