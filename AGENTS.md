# strapi-react-frontend

Vite + React 19 SPA. Reads `GET /api/site-info` from [strapi-react](https://github.com/zerops-recipe-apps/strapi-react).

- `VITE_API_URL` baked at build from project vault `API_URL` (or `DEV_API_URL` on dev workspace).
- Zerops `prod` → `static` runtime; `dev` → `zsc noop`, then `npm run dev`.
