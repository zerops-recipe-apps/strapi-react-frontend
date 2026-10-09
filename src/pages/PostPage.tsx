import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PostCover } from '../components/PostCover'
import {
  fetchBlogPostBySlug,
  formatDate,
  getApiBase,
  postCoverUrl,
  type BlogPost,
} from '../lib/strapi'

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

  const date = formatDate(post?.publishedAt)
  const remoteCover = post ? postCoverUrl(post) : undefined

  return (
    <div className="shell shell--article">
      <nav className="breadcrumb">
        <Link to="/">All posts</Link>
      </nav>

      {loading && <p className="status">Loading post…</p>}
      {error && (
        <p className="status status--error">
          {error}. <Link to="/">Back to home</Link>
        </p>
      )}

      {post && !loading && !error && (
        <article className="article">
          <header className="article__header">
            {date && <time className="article__date" dateTime={post.publishedAt}>{date}</time>}
            <h1>{post.title}</h1>
            <p className="article__excerpt">{post.excerpt}</p>
          </header>

          <div className="article__cover">
            <PostCover slug={post.slug} title={post.title} remoteUrl={remoteCover} />
          </div>

          <div className="article__body">
            {post.body.split(/\n+/).filter(Boolean).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <footer className="article__footer">
            <Link to="/" className="article__back">Back to all posts</Link>
            <a href={`${apiBase}/admin`} target="_blank" rel="noreferrer">
              Edit in Strapi admin
            </a>
          </footer>
        </article>
      )}
    </div>
  )
}
