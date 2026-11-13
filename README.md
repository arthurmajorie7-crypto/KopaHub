# KopaHub

Community finance platform for group savings, loans, payments, and reporting.

## Run with PostgreSQL

1. Install Node.js 20+ and start a PostgreSQL server.
2. Copy `.env.example` to `.env`, then set `DATABASE_URL` to your PostgreSQL connection string and replace `JWT_SECRET` with a long random value.
3. Install packages and generate Prisma Client:
   ```bash
   npm install
   ```
4. Create/update the local database schema and seed demo data:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Start the frontend and API:
   ```bash
   npm run dev
   ```

Frontend: http://localhost:5173  
API health (checks database connection): http://localhost:5000/api/health

Seeded admin login: `admin@kopahub.io` / value of `DEMO_PASSWORD` (defaults to `Password123!`). Registration and all app data are stored in PostgreSQL. Demo seed data is optional; omit `npm run db:seed` for an empty database.

For shared/production environments, use committed migrations (`npm run db:migrate -- --name init` on the first migration) and `prisma migrate deploy` during deployment rather than `db:push`. Set a real `JWT_SECRET`, secure `DATABASE_URL`, `NODE_ENV=production`, and configure an email provider before exposing password reset.

## Stack

- React 19, Vite, Tailwind CSS, React Router, Axios
- Express, JWT, bcrypt
- PostgreSQL and Prisma
