import { useEffect, useState } from 'react'
import './App.css'

type SiteInfo = {
  title: string
  description: string
}

type BlogPost = {
  title: string
  slug: string
  excerpt: string
  body: string
}

const apiBase = import.meta.env.VITE_API_URL ?? ''

function entityFields<T extends Record<string, unknown>>(raw: Record<string, unknown> | undefined): T | undefined {
  if (!raw) {
    return undefined
  }
  const data = (raw.attributes ?? raw) as T
  return data
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

export default function App() {
  const [site, setSite] = useState<SiteInfo | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchJson('/api/site-info'),
      fetchJson('/api/blog-posts?sort=publishedAt:desc'),
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

  return (
    <main className="page">
      <header>
        <p className="eyebrow">Strapi + React on Zerops</p>
        <h1>{site?.title ?? 'Headless CMS demo'}</h1>
        {site?.description && <p className="lede">{site.description}</p>}
      </header>

      {loading && <p className="status">Loading content from Strapi…</p>}
      {error && (
        <p className="status error">
          Could not load content from <code>{apiBase || '(set VITE_API_URL)'}</code>: {error}
        </p>
      )}

      {!loading && !error && (
        <section className="posts" aria-labelledby="blog-heading">
          <h2 id="blog-heading">Blog</h2>
          {posts.length === 0 ? (
            <p className="status">No published blog posts yet. Add some in Strapi admin.</p>
          ) : (
            <ul className="post-list">
              {posts.map((post) => (
                <li key={post.slug}>
                  <article className="card">
                    <h3>{post.title}</h3>
                    <p className="excerpt">{post.excerpt}</p>
                    <p className="body">{post.body}</p>
                  </article>
                </li>
              ))}
            </ul>
          )}
          <p className="hint">
            Edit posts in Strapi admin at{' '}
            <a href={`${apiBase}/admin`} target="_blank" rel="noreferrer">
              {apiBase}/admin
            </a>
            , then refresh this page.
          </p>
        </section>
      )}
    </main>
  )
}
