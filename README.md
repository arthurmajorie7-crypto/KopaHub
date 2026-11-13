# KopaHub

Community finance platform for group savings, loans, payments, and reporting.

## Local development

Requirements: Node.js 20+ and PostgreSQL. Copy `.env.example` to `.env`, configure `DATABASE_URL` and `JWT_SECRET`, then:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Frontend: http://localhost:5173  
API health: http://localhost:5000/api/health

## Production deployment (Vercel + Render)

The repository includes `vercel.json` for the Vite SPA and `render.yaml` for the Express API. Deploy the API service on Render first, and create/provide a PostgreSQL database.

### Render API

1. Create a Render Blueprint from this repository and select the `copilot/scaffold-kopahub` branch (or deploy that branch as a Web Service).
2. Set `DATABASE_URL` to the PostgreSQL connection string and `CLIENT_ORIGIN` to the final Vercel site origin (for example `https://kopahub.vercel.app`, without a trailing slash).
3. Set a strong, unique `JWT_SECRET` if not generated automatically.
4. Before serving traffic for the first time, run `npx prisma db push` once in the service shell to create the schema. This project currently has no committed Prisma migration history; for long-lived production data, establish and commit migrations before making schema changes.
5. Confirm `https://<render-service>.onrender.com/api/health` returns `status: ok` and `database: connected`.

### Vercel frontend

1. Import the same branch into Vercel. Use the repository root, build command `npm run build`, and output directory `dist`.
2. Set `VITE_API_URL` to the Render API origin, e.g. `https://kopahub-api.onrender.com` (no trailing slash). It must include the API host, not `/api`; frontend requests already add `/api`.
3. Deploy or redeploy after setting the variable, then test registration and sign-in.

Do not put database credentials or JWT secrets in Vercel. `DEMO_PASSWORD` is only used for optional demo seeding; do not seed a public production account with a known default password.

## Stack

- React, Vite, Tailwind CSS, React Router, Axios
- Express, JWT, bcrypt
- PostgreSQL and Prisma
