# Rules

## Product Principles
- Keep weekly planning lightweight; avoid heavy setup steps.
- Prefer calm, readable UI over dense dashboards.
- Make grocery lists one-click and easy to share.

## Engineering Rules
- Use Next.js App Router patterns and TypeScript.
- Store auth sessions in SQLite via Prisma.
- Keep auth tokens httpOnly and short-lived (rotate via DB sessions).
- Add new data models in `prisma/schema.prisma` with clear relations.
- Use Biome for linting and formatting (`pnpm lint`, `pnpm format`).
- Use Vitest for tests (`pnpm test`, `pnpm test:watch`).
- Place authenticated routes under `src/app/(app)/app/**` (e.g., `/app`, `/app/meals`).
- Use Zustand for client-side state management.
- Use TanStack Query for data fetching and caching.

## AI Agent Notes
- Favor small, reversible changes.
- Update `docs/PLANS.md` when roadmap shifts.
