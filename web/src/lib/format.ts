const intFormatter = new Intl.NumberFormat('zh-CN')

export function formatInt(n: number): string {
  return intFormatter.format(n)
}

/** 12345 -> "1.2 万"，123456789 -> "1.23 亿" */
export function formatCompact(n: number): string {
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`
  if (n >= 1e4) return `${(n / 1e4).toFixed(1)} 万`
  return formatInt(n)
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** 折叠所有空白并截断，用于卡片摘要与 tooltip */
export function snippet(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max)}…` : flat
}
