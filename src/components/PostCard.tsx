import { Link } from 'react-router-dom'
import { PostCover } from './PostCover'
import type { BlogPost } from '../lib/strapi'
import { formatDate, postCoverUrl } from '../lib/strapi'

type PostCardProps = {
  post: BlogPost
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const remoteCover = postCoverUrl(post)
  const date = formatDate(post.publishedAt)

  return (
    <Link
      to={`/posts/${post.slug}`}
      className={`post-card post-card--link${featured ? ' post-card--featured' : ''}`}
    >
      <div className="post-card__media">
        <PostCover slug={post.slug} title={post.cover?.alternativeText ?? post.title} remoteUrl={remoteCover} />
      </div>
      <div className="post-card__body">
        {date && <time className="post-card__date" dateTime={post.publishedAt}>{date}</time>}
        <h3>{post.title}</h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
        <p className="post-card__text">{post.body}</p>
        <span className="post-card__cta">Read article</span>
      </div>
    </Link>
  )
}
