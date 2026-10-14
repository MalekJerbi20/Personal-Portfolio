# Portfolio API

This Node API is deployed on Render. MongoDB Atlas stores the portfolio document, while Cloudinary stores the CV and project media. The browser never receives database or Cloudinary secret credentials.

## Local setup

1. Copy `.env.example` to `.env` and fill in the values locally.
2. Install and start MongoDB access, then run `npm install` in this folder.
3. Generate the admin password hash with `npm run hash-password` and place the printed hash in `ADMIN_PASSWORD_HASH`.
4. Start the API with `npm run dev`. The Vite app proxies `/api` to `http://localhost:4000` by default.
5. Seed the database once if needed with `npm run seed:portfolio`.

The first successful API start seeds Atlas from `../public/portfolio-content.json` if the `portfolio` collection has no main document.

## Render deployment

Create a Render Web Service from the repository root. Use these commands:

- Build: `cd server && npm install && npm run build`
- Start: `cd server && npm start`

Set the following environment variables in Render:

- `MONGODB_URI`: Atlas connection string for a database user restricted to this database
- `MONGODB_DB`: database name, for example `malek_portfolio`
- `ADMIN_EMAIL`: admin login email
- `ADMIN_PASSWORD_HASH`: output from `npm run hash-password`
- `JWT_SECRET`: random secret of at least 32 characters
- `FRONTEND_ORIGINS`: comma-separated exact Netlify site origin(s), such as `https://your-site.netlify.app`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary account credentials

Do not use `VITE_` prefixes for backend secrets. Keep Atlas network access limited to Render's outbound IPs where your Render plan supports stable egress. Otherwise use Atlas network access controls deliberately and use a database user with access only to this portfolio database.

## API

- `GET /api/health`: health check
- `GET /api/portfolio`: public portfolio content
- `POST /api/admin/login`: verify email/password and return a short-lived bearer token
- `GET /api/admin/me`: verify the current token
- `PUT /api/admin/portfolio`: validate and update shared content
- `POST /api/admin/uploads`: accept an authenticated, size-limited CV or project image and forward it to Cloudinary; Cloudinary credentials remain on Render
