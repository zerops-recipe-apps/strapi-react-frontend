import { useEffect, useMemo, useState } from 'react'
import { ArticleFilters } from '../components/ArticleFilters'
import { PostCard } from '../components/PostCard'
import { SiteHeader } from '../components/SiteHeader'
import {
  entityFields,
  fetchJson,
  getApiBase,
  parseBlogPostList,
  type BlogPost,
  type SiteInfo,
} from '../lib/strapi'
import { allFilterTags, postMatchesFilter } from '../lib/postMeta'

export function HomePage() {
  const apiBase = getApiBase()
  const [site, setSite] = useState<SiteInfo | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

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

  const filterTags = useMemo(() => allFilterTags(posts), [posts])
  const visiblePosts = useMemo(
    () => posts.filter((post) => postMatchesFilter(post, filter)),
    [posts, filter],
  )

  return (
    <div className="articles-page">
      <SiteHeader />

      <div className="shell articles-page__main">
        <h1 className="visually-hidden">Articles</h1>
        {site?.description && (
          <header className="articles-page__intro">
            <p className="articles-page__lede">{site.description}</p>
          </header>
        )}

        {posts.length > 0 && <ArticleFilters tags={filterTags} active={filter} onChange={setFilter} />}

        {loading && <p className="status">Loading content from Strapi…</p>}
        {error && (
          <p className="status status--error">
            Could not load content from <code>{apiBase || '(set VITE_API_URL)'}</code>: {error}
          </p>
        )}

        {!loading && !error && (
          <section className="article-list" aria-label="Articles">
            {visiblePosts.length === 0 ? (
              <p className="status">No posts in this category.</p>
            ) : (
              visiblePosts.map((post) => <PostCard key={post.slug} post={post} />)
            )}
          </section>
        )}

        <footer className="articles-page__footer">
          <span>Content from Strapi — edit in</span>
          <a href={`${apiBase}/admin`} target="_blank" rel="noreferrer">admin</a>
        </footer>
      </div>
    </div>
  )
}
