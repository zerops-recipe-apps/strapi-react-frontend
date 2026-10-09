import { useEffect, useState } from 'react'
import { PostCard } from '../components/PostCard'
import {
  fetchJson,
  getApiBase,
  parseBlogPostList,
  type BlogPost,
  type SiteInfo,
  entityFields,
} from '../lib/strapi'

export function HomePage() {
  const apiBase = getApiBase()
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
        setPosts(parseBlogPostList(postsJson))
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
            <p className="blog__sub">Click a post for the full article.</p>
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
