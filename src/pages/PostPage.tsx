import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import {
  fetchBlogPostBySlug,
  formatDate,
  getApiBase,
  type BlogPost,
} from '../lib/strapi'
import { estimateReadTime, getPostMeta } from '../lib/postMeta'

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const apiBase = getApiBase()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setError('Missing post slug')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fetchBlogPostBySlug(slug)
      .then((entry) => {
        if (!entry) {
          throw new Error('Post not found')
        }
        setPost(entry)
      })
      .catch((err: Error) => {
        setPost(null)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const meta = post ? getPostMeta(post) : null
  const date = formatDate(post?.publishedAt)
  const readTime = post ? estimateReadTime(post.body) : null
  const author = meta?.author ?? 'Zerops'
  const initial = author.charAt(0).toUpperCase()

  return (
    <div className="articles-page">
      <SiteHeader />

      <div className="shell shell--article">
        <nav className="breadcrumb">
          <Link to="/">← Articles</Link>
        </nav>

        {loading && <p className="status">Loading post…</p>}
        {error && (
          <p className="status status--error">
            {error}. <Link to="/">Back to articles</Link>
          </p>
        )}

        {post && !loading && !error && meta && (
          <article className="article">
            <div className="article-hero">
              <div className="article-card__tags article__tags">
                {meta.tags.map((tag) => (
                  <span key={tag} className="article-card__tag">{tag}</span>
                ))}
              </div>

              <header className="article__header">
                <h1>{post.title}</h1>
                <p className="article__lead">{post.excerpt}</p>
              </header>

              <footer className="article-card__meta article__meta">
                <span className="article-card__author">
                  <span className="article-card__avatar" aria-hidden>{initial}</span>
                  {author}
                </span>
                {date && <time dateTime={post.publishedAt}>{date}</time>}
                {readTime && <span className="article-card__read">{readTime}</span>}
              </footer>
            </div>

            <div className="article__content">
              <div className="article__body">
                {post.body.split(/\n+/).filter(Boolean).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <footer className="article__footer">
              <Link to="/">Back to articles</Link>
              <a href={`${apiBase}/admin`} target="_blank" rel="noreferrer">
                Edit in Strapi admin
              </a>
            </footer>
          </article>
        )}
      </div>
    </div>
  )
}
