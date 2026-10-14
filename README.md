# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Deployment architecture

- Netlify hosts the Vite frontend. Publish `dist`; `public/_redirects` supplies the React Router fallback.
- Render hosts the API in `server/`. The Render blueprint is in `render.yaml`; API setup details and required environment variables are in `server/README.md` and `server/.env.example`.
- MongoDB Atlas stores the shared portfolio data. Cloudinary stores and serves the CV and project gallery images.

Set `VITE_API_URL` in Netlify to the Render API URL ending in `/api`. Set `FRONTEND_ORIGINS` in Render to the exact Netlify site origin. Do not put database, JWT, admin password, or Cloudinary secrets in any `VITE_*` variable.

Open `/admin`, sign in, edit content, and choose **Publish changes** to write to Atlas. Uploads require Cloudinary configuration. The admin token is short-lived and held only in memory; a page refresh requires signing in again. The bundled `public/portfolio-content.json` remains a startup seed and public-site fallback, not the ongoing source after the database has been initialized.

Before launch, replace `https://your-domain.example` in `public/portfolio-content.json`, configure the Netlify and Render environment variables, create the Atlas database user/network rules and Cloudinary account, and add the real contact/profile details. Admin sign-in is not configured until the Render `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `JWT_SECRET` values are set.
