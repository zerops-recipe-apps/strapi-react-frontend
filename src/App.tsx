import { useEffect, useState } from 'react'
import coverDeploy from './assets/covers/deploy-strapi-on-zerops.svg?url'
import coverHeadless from './assets/covers/headless-cms-react-spa.svg?url'
import coverDraft from './assets/covers/draft-to-published.svg?url'
import './App.css'

type SiteInfo = {
  title: string
  description: string
}

type StrapiMedia = {
  url?: string
  alternativeText?: string | null
  width?: number
  height?: number
}

type BlogPost = {
  title: string
  slug: string
  excerpt: string
  body: string
  publishedAt?: string
  coverUrl?: string | null
  cover?: StrapiMedia | null
}

const apiBase = import.meta.env.VITE_API_URL ?? ''

const DEMO_COVER_BY_SLUG: Record<string, string> = {
  'deploy-strapi-on-zerops': coverDeploy,
  'headless-cms-react-spa': coverHeadless,
  'draft-to-published': coverDraft,
}

function entityFields<T extends Record<string, unknown>>(raw: Record<string, unknown> | undefined): T | undefined {
  if (!raw) {
    return undefined
  }
  return (raw.attributes ?? raw) as T
}

function absoluteAssetUrl(pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) {
    return undefined
  }
  if (pathOrUrl.startsWith('http')) {
    return pathOrUrl
  }
  return `${apiBase.replace(/\/$/, '')}${pathOrUrl}`
}

function postCoverUrl(post: BlogPost): string | undefined {
  const fromApi = absoluteAssetUrl(post.cover?.url) ?? absoluteAssetUrl(post.coverUrl)
  if (fromApi) {
    return fromApi
  }
  return DEMO_COVER_BY_SLUG[post.slug]
}

function formatDate(iso?: string) {
  if (!iso) {
    return null
  }
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function fetchJson(path: string) {
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

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const image = postCoverUrl(post)
  const date = formatDate(post.publishedAt)

  return (
    <article className={`post-card${featured ? ' post-card--featured' : ''}`}>
      <div className="post-card__media">
        {image ? (
          <img src={image} alt={post.cover?.alternativeText ?? post.title} loading="lazy" decoding="async" />
        ) : (
          <div className="post-card__placeholder" aria-hidden />
        )}
      </div>
      <div className="post-card__body">
        {date && <time className="post-card__date" dateTime={post.publishedAt}>{date}</time>}
        <h3>{post.title}</h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
        <p className="post-card__text">{post.body}</p>
      </div>
    </article>
  )
}

export default function App() {
  const [site, setSite] = useState<SiteInfo | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchJson('/api/site-info'),
      fetchJson('/api/blog-posts?populate=cover&sort=publishedAt:desc'),
    ])
      .then(([siteJson, postsJson]) => {
        const siteData = entityFields<SiteInfo>(siteJson?.data as Record<string, unknown>)
        if (!siteData?.title) {
          throw new Error('Missing site-info content in Strapi')
        }
        setSite(siteData)

        const list = (postsJson?.data ?? []) as Record<string, unknown>[]
        const parsed = list
          .map((item) => entityFields<BlogPost>(item))
          .filter((post): post is BlogPost => Boolean(post?.title && post?.excerpt))
        setPosts(parsed)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const [featured, ...rest] = posts

  return (
    <div className="shell">
      <header className="hero">
        <p className="hero__eyebrow">Strapi + React on Zerops</p>
        <h1>{site?.title ?? 'Headless CMS demo'}</h1>
        {site?.description && <p className="hero__lede">{site.description}</p>}
      </header>

      {loading && <p className="status">Loading content from Strapi…</p>}
      {error && (
        <p className="status status--error">
          Could not load content from <code>{apiBase || '(set VITE_API_URL)'}</code>: {error}
        </p>
      )}

      {!loading && !error && (
        <section className="blog" aria-labelledby="blog-heading">
          <div className="blog__head">
            <h2 id="blog-heading">Latest posts</h2>
            <p className="blog__sub">Images and copy are managed in Strapi.</p>
          </div>

          {posts.length === 0 ? (
            <p className="status">No published blog posts yet. Add some in Strapi admin.</p>
          ) : (
            <div className="blog__layout">
              {featured && <PostCard post={featured} featured />}
              {rest.length > 0 && (
                <div className="blog__grid">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          <footer className="blog__footer">
            <span>Edit posts and cover images in</span>
            <a href={`${apiBase}/admin`} target="_blank" rel="noreferrer">
              Strapi admin
            </a>
          </footer>
        </section>
      )}
    </div>
  )
}
