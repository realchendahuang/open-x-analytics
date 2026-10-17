import { useState, useEffect } from 'react'
import type { Post, DailyOverview, Summary } from '../types/analytics'

export function useAnalyticsData() {
  const [posts, setPosts] = useState<Post[]>([])
  const [overview, setOverview] = useState<DailyOverview[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        let cleanBase = import.meta.env.BASE_URL || './'
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname
          if (pathname.startsWith('/x')) {
            cleanBase = '/x/'
          }
        }
        if (!cleanBase.endsWith('/')) {
          cleanBase = `${cleanBase}/`
        }

        const [postsRes, ovRes, sumRes] = await Promise.all([
          fetch(`${cleanBase}data/posts.json`),
          fetch(`${cleanBase}data/overview.json`),
          fetch(`${cleanBase}data/summary.json`),
        ])

        if (!postsRes.ok || !ovRes.ok || !sumRes.ok) {
          throw new Error('Failed to fetch analytics datasets')
        }

        const [postsData, ovData, sumData] = await Promise.all([
          postsRes.json(),
          ovRes.json(),
          sumRes.json(),
        ])

        setPosts(postsData)
        setOverview(ovData)
        setSummary(sumData)
      } catch (err: any) {
        console.error('Data fetch error:', err)
        setError(err.message || 'An error occurred while loading data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { posts, overview, summary, loading, error }
}
