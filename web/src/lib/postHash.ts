import { useSyncExternalStore } from 'react'

/**
 * 「当前打开的推文」状态保存在 URL hash（#post-<id>）中，
 * 散点图、阶段卡片和列表都可以直接调用 openPost，并且链接可分享。
 */

const listeners = new Set<() => void>()

function parse(): string | null {
  const match = /^#post-(\d+)$/.exec(window.location.hash)
  return match ? match[1] : null
}

function emit() {
  listeners.forEach(fn => fn())
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('hashchange', callback)
  window.addEventListener('popstate', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('hashchange', callback)
    window.removeEventListener('popstate', callback)
  }
}

export function usePostHash(): string | null {
  return useSyncExternalStore(subscribe, parse, () => null)
}

/** replace=true 用于弹窗内上一篇/下一篇，避免历史记录堆积 */
export function openPost(id: string, options: { replace?: boolean } = {}) {
  const url = `${window.location.pathname}${window.location.search}#post-${id}`
  if (options.replace) history.replaceState(null, '', url)
  else history.pushState(null, '', url)
  emit()
}

export function closePost() {
  if (parse() === null) return
  history.replaceState(null, '', window.location.pathname + window.location.search)
  emit()
}
