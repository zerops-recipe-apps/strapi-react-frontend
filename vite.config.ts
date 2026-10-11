import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const strapiTarget = env.VITE_STRAPI_PROXY ?? 'http://127.0.0.1:1337'

  return {
    plugins: [react()],
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
