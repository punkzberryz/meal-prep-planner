# Meal Prep Planner

A Next.js app for planning weekly meals with a calendar-driven dashboard, grocery lists, and guided cooking steps. The current focus is the authenticated app shell and core planning workflows.

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- `pnpm` package manager

### Install
```bash
pnpm install
```

### Environment
Create a `.env` file at the repo root:
```bash
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret-change-me
```

### Database
```bash
pnpm prisma migrate dev
```

### Run the app
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard lives at `/app`.

## Scripts
- `pnpm dev` — start the dev server
- `pnpm build` — create a production build
- `pnpm start` — run the production server
- `pnpm lint` — run Biome checks
- `pnpm format` — auto-format with Biome
- `pnpm test` — run Vitest tests
- `pnpm prisma migrate dev` — apply migrations
- `pnpm prisma studio` — browse the SQLite DB

## Project Structure
- `src/app/(auth)/` — login and registration pages
- `src/app/(app)/app/` — authenticated dashboard and app pages
- `src/app/api/` — auth API routes
- `src/components/ui/` — shadcn/ui components
- `src/lib/` — Prisma client + auth helpers
- `prisma/` — schema and migrations
- `docs/` — planning notes for AI agents

## Auth Notes
- JWT is stored in an httpOnly cookie.
- Sessions are persisted in SQLite via Prisma.

## Next Up
- Meal CRUD + default meals seeding
- Weekly plan generation rules
- Grocery list aggregation

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
