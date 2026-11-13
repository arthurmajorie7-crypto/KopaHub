# KopaHub

A modern fintech community platform for savings groups, loans, payments, and reporting.

## Stack

- React 19 + Vite + Tailwind CSS
- Express.js + Node.js
- JWT Authentication + bcryptjs
- Prisma + PostgreSQL-ready schema

## Local setup

1. Install dependencies:
   npm install
2. Create a `.env` file based on `.env.example`.
3. Start the full app:
   npm run dev

The frontend runs on http://localhost:5173 and the API on http://localhost:5000.

## Included features

- Authentication flow (login, register, reset, forgot password)
- Dashboard and analytics cards
- Groups management and member administration
- Loans module with repayment visibility
- Payments and receipts overview
- Reports overview with PDF/Excel export actions
- Profile and admin views
- Responsive UI with reusable components

## Notes

This scaffold includes a PostgreSQL-ready Prisma schema and a demo Express backend that runs with mock data when a database is not connected. It is designed to be extended into a production-ready implementation.
