import { useCallback, useEffect, useState } from 'react'
import { fetchData } from '../lib/data'

export interface JsonState<T> {
  data: T | null
  error: string | null
  loading: boolean
  retry: () => void
}

/** 按需加载一个数据文件；enabled=false 时不发请求。 */
export function useJson<T>(file: string, enabled = true): JsonState<T> {
  const [result, setResult] = useState<{ data: T | null; error: string | null }>({
    data: null,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    fetchData<T>(file).then(
      data => {
        if (!cancelled) setResult({ data, error: null })
      },
      (err: unknown) => {
        if (!cancelled) setResult({ data: null, error: err instanceof Error ? err.message : String(err) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [file, enabled, attempt])

  const retry = useCallback(() => {
    setResult({ data: null, error: null })
    setAttempt(n => n + 1)
  }, [])

  return {
    data: result.data,
    error: result.error,
    loading: enabled && result.data === null && result.error === null,
    retry,
  }
}
