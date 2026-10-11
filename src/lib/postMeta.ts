import type { BlogPost } from './strapi'

export type PostMeta = {
  tags: string[]
  author: string
}

const POST_META: Record<string, PostMeta> = {
  'deploy-strapi-on-zerops': { tags: ['Zerops', 'Strapi'], author: 'Zerops' },
  'headless-cms-react-spa': { tags: ['Strapi', 'tech'], author: 'Zerops' },
  'draft-to-published': { tags: ['Strapi', 'Updates'], author: 'Zerops' },
}

export function getPostMeta(post: BlogPost): PostMeta {
  return POST_META[post.slug] ?? { tags: ['Strapi'], author: 'Zerops' }
}

export function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

export function allFilterTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>()
  for (const post of posts) {
    for (const tag of getPostMeta(post).tags) {
      tags.add(tag)
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b))
}

export function postMatchesFilter(post: BlogPost, filter: string): boolean {
  if (filter === 'All') {
    return true
  }
  return getPostMeta(post).tags.some((tag) => tag.toLowerCase() === filter.toLowerCase())
}
