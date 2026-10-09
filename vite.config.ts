import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // SVG covers must be real files — inlined data: URIs fail in some browsers on static hosts.
    assetsInlineLimit: 0,
  },
})
