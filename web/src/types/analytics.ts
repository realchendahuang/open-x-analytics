export type StageKey = 'icebreaker' | 'growth' | 'flywheel'

/** 预计算的内容分类（由 scripts/prepare_web_data.py 生成） */
export type PostTag = 'business' | 'tools' | 'probes'

export interface Post {
  id: string
  /** ISO 日期 YYYY-MM-DD */
  date: string
  text: string
  link: string
  is_reply: boolean
  impressions: number
  likes: number
  bookmarks: number
  new_follows: number
  replies: number
  reposts: number
  url_clicks: number
  bm_like_ratio: number
  stage: StageKey
  viral_ratio: number
  followers_at_post: number
  daily_impressions: number
  daily_new_follows: number
  is_pitfall: boolean
  is_article: boolean
  tags: PostTag[]
}

export interface DailyOverview {
  /** ISO 日期 YYYY-MM-DD */
  date: string
  impressions: number
  likes: number
  engagements: number
  bookmarks: number
  shares: number
  new_follows: number
  unfollows: number
  net_follows: number
  replies: number
  reposts: number
  profile_visits: number
  posts_count: number
}

export interface StageStat {
  key: StageKey
  count: number
  avg_impressions: number
  avg_likes: number
  bm_like_ratio: number
  avg_viral_ratio: number
  median_viral_ratio: number
  max_viral_ratio: number
  max_viral_post_id: string
  max_viral_snippet: string
}

export interface Summary {
  total_posts: number
  main_posts: number
  reply_posts: number
  total_impressions: number
  total_likes: number
  total_bookmarks: number
  total_new_follows: number
  overall_bm_like_ratio: number
  pitfall_count: number
  max_single_follow: number
  overview_impressions: number
  overview_new_follows: number
  overview_unfollows: number
  overview_net_follows: number
  retention_rate: number
  overview_days: number
  data_start: string
  data_through: string
  stages: StageStat[]
}
