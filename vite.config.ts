import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/** Match recipe vault: https://strapi-${zeropsSubdomainHost}-1337.prg1.zerops.app */
function resolveViteApiUrl(env: Record<string, string>): string {
  for (const key of ['VITE_API_URL', 'API_URL', 'DEV_API_URL']) {
    const value = env[key]?.trim() ?? ''
    if (value.startsWith('http') && !value.includes('${')) {
      return value.replace(/\/$/, '')
    }
  }

  const host = env.zeropsSubdomainHost?.trim()
  if (host) {
    return `https://strapi-${host}-1337.prg1.zerops.app`
  }

  return ''
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const strapiTarget = env.VITE_STRAPI_PROXY ?? 'http://127.0.0.1:1337'
  const apiUrl = resolveViteApiUrl(env)

  return {
    plugins: [react()],
    define: apiUrl ? { 'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl) } : {},
    build: {
      // SVG covers must be real files — inlined data: URIs fail in some browsers on static hosts.
      assetsInlineLimit: 0,
    },
    server: {
      proxy: {
        '/api': {
          target: strapiTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: strapiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
