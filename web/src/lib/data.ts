const cache = new Map<string, Promise<unknown>>()

/**
 * 读取 public/data 下的 JSON。
 * 相对 document.baseURI 解析，因此部署在根路径、/x/ 或 /<repo>/ 子路径都能工作。
 * 同一文件只请求一次（也避免 StrictMode 下的重复请求）；失败时清除缓存以便重试。
 */
export function fetchData<T>(file: string): Promise<T> {
  const cached = cache.get(file)
  if (cached) return cached as Promise<T>

  const url = new URL(`${import.meta.env.BASE_URL}data/${file}`, document.baseURI)
  const request = fetch(url).then(res => {
    if (!res.ok) throw new Error(`${file} 加载失败（HTTP ${res.status}）`)
    return res.json() as Promise<T>
  })
  request.catch(() => cache.delete(file))
  cache.set(file, request)
  return request
}
