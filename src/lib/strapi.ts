export type SiteInfo = {
  title: string
  description: string
}

export type StrapiMedia = {
  url?: string
  alternativeText?: string | null
  width?: number
  height?: number
}

export type BlogPost = {
  title: string
  slug: string
  excerpt: string
  body: string
  publishedAt?: string
  coverUrl?: string | null
  cover?: StrapiMedia | null
}

const apiBase = import.meta.env.VITE_API_URL ?? ''

export function getApiBase() {
  return apiBase
}

export function entityFields<T extends Record<string, unknown>>(
  raw: Record<string, unknown> | undefined,
): T | undefined {
  if (!raw) {
    return undefined
  }
  return (raw.attributes ?? raw) as T
}

export function absoluteAssetUrl(pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) {
    return undefined
  }
  if (pathOrUrl.startsWith('http')) {
    return pathOrUrl
  }
  return `${apiBase.replace(/\/$/, '')}${pathOrUrl}`
}

export function postCoverUrl(post: BlogPost): string | undefined {
  return absoluteAssetUrl(post.cover?.url) ?? absoluteAssetUrl(post.coverUrl)
}

export function formatDate(iso?: string) {
  if (!iso) {
    return null
  }
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function fetchJson(path: string) {
  const url = `${apiBase.replace(/\/$/, '')}${path}`
  const res = await fetch(url)
  const contentType = res.headers.get('content-type') ?? ''
  if (!res.ok) {
    const body = contentType.includes('application/json')
      ? JSON.stringify(await res.json())
      : await res.text()
    throw new Error(`${path} returned ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
  }
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON from ${path}. Check VITE_API_URL at build time (currently ${apiBase || 'unset'}).`,
    )
  }
  return res.json()
}

export function parseBlogPostList(json: { data?: unknown }): BlogPost[] {
  const list = (json?.data ?? []) as Record<string, unknown>[]
  return list
    .map((item) => entityFields<BlogPost>(item))
    .filter((post): post is BlogPost => Boolean(post?.title && post?.excerpt && post?.slug))
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const encoded = encodeURIComponent(slug)
  const json = await fetchJson(
    `/api/blog-posts?filters[slug][$eq]=${encoded}&populate=cover`,
  )
  const posts = parseBlogPostList(json)
  return posts[0] ?? null
}
