export interface Post {
  id: string
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
  stage: string
  viral_ratio: number
  followers_at_post: number
  daily_impressions: number
  daily_new_follows: number
  is_pitfall: boolean
}

export interface DailyOverview {
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

export interface Summary {
  total_posts: number
  total_impressions: number
  total_bookmarks: number
  total_likes: number
  total_new_follows: number
  overall_bm_like_ratio: number
  pitfall_count: number
  overview_impressions: number
  overview_new_follows: number
  overview_unfollows: number
  overview_net_follows: number
  retention_rate: number
  main_posts: number
  reply_posts: number
  max_single_follow: number
}

export type StageFilter = 'all' | 'icebreaker' | 'growth' | 'flywheel'
export type PostCategory = 'all' | 'pitfall' | 'high_bm' | 'viral' | 'conversion'
