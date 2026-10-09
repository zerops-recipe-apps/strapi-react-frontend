import { useEffect, useState } from 'react'
import './App.css'

type SiteInfo = {
  title: string
  description: string
}

const apiBase = import.meta.env.VITE_API_URL ?? ''

export default function App() {
  const [site, setSite] = useState<SiteInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = `${apiBase.replace(/\/$/, '')}/api/site-info`
    fetch(url)
      .then(async (res) => {
        const contentType = res.headers.get('content-type') ?? ''
        if (!res.ok) {
          const body = contentType.includes('application/json')
            ? JSON.stringify(await res.json())
            : await res.text()
          throw new Error(`Strapi returned ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}`)
        }
        if (!contentType.includes('application/json')) {
          throw new Error(
            'Expected JSON from Strapi. If VITE_API_URL was missing at build time, the app may be calling this host instead of the Strapi API.',
          )
        }
        const json = await res.json()
        const raw = json?.data as Record<string, unknown> | undefined
        const data = (raw?.attributes ?? raw) as SiteInfo | undefined
        if (!data?.title) {
          throw new Error('Missing site-info content in Strapi')
        }
        setSite(data)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="page">
      <header>
        <p className="eyebrow">Strapi + React on Zerops</p>
        <h1>Headless CMS demo</h1>
      </header>

      {loading && <p className="status">Loading content from Strapi…</p>}
      {error && (
        <p className="status error">
          Could not load <code>/api/site-info</code> from{' '}
          <code>{apiBase || '(set VITE_API_URL)'}</code>: {error}
        </p>
      )}
      {site && (
        <article className="card">
          <h2>{site.title}</h2>
          <p>{site.description}</p>
          <p className="hint">
            Edit this in Strapi admin at{' '}
            <a href={`${apiBase}/admin`} target="_blank" rel="noreferrer">
              {apiBase}/admin
            </a>
            , then refresh this page.
          </p>
        </article>
      )}
    </main>
  )
}
