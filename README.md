# Strapi + React (frontend)

Vite + React app for [zerops-recipe-apps/strapi-react](https://github.com/zerops-recipe-apps/strapi-react). Deploy with `zeropsSetup: dev` or `prod` from [`zeropsio/recipes/strapi-react`](https://github.com/zeropsio/recipes/tree/main/strapi-react).

Set `VITE_API_URL` to your Strapi public URL for production builds. The page loads **Site Info** from `/api/site-info`.

**Local dev:** run Strapi (`yarn develop` on `:1337` in [strapi-react](https://github.com/zerops-recipe-apps/strapi-react)), then:

```bash
npm run dev    # :5173 — proxies /api to http://127.0.0.1:1337 when VITE_API_URL is unset
```

Copy `.env.example` to `.env.local` if you need a custom API URL or proxy target.
