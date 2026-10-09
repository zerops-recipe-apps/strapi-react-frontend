import coverDeploy from '../assets/covers/deploy-strapi-on-zerops.svg?raw'
import coverHeadless from '../assets/covers/headless-cms-react-spa.svg?raw'
import coverDraft from '../assets/covers/draft-to-published.svg?raw'

const DEMO_COVER_SVG: Record<string, string> = {
  'deploy-strapi-on-zerops': coverDeploy,
  'headless-cms-react-spa': coverHeadless,
  'draft-to-published': coverDraft,
}

type PostCoverProps = {
  slug: string
  title: string
  remoteUrl?: string
}

export function PostCover({ slug, title, remoteUrl }: PostCoverProps) {
  if (remoteUrl) {
    return (
      <img
        className="post-card__img"
        src={remoteUrl}
        alt={title}
        loading="lazy"
        decoding="async"
      />
    )
  }

  const markup = DEMO_COVER_SVG[slug]
  if (markup) {
    return (
      <div
        className="post-card__svg"
        role="img"
        aria-label={title}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    )
  }

  return <div className="post-card__placeholder" aria-hidden />
}
