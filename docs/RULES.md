# Rules

## Product Principles
- Keep weekly planning lightweight; avoid heavy setup steps.
- Prefer calm, readable UI over dense dashboards.
- Make grocery lists one-click and easy to share.
- UI must be responsive and mobile-friendly; layouts should adapt cleanly to small screens.
- Visual tone: warm sunrise palette (apricot, coral, sunny yellow, mint, cream) with soft gradients and gentle depth.
- Mood: friendly, cozy, and lightweight; emphasize calm meal planning rather than productivity pressure.
- Typography and shapes: rounded surfaces, soft shadows, generous whitespace, and clear hierarchy.

## Engineering Rules
- Use Next.js App Router patterns and TypeScript.
- Store auth sessions in SQLite via Prisma.
- Keep auth tokens httpOnly and short-lived (rotate via DB sessions).
- Add new data models in `prisma/schema.prisma` with clear relations.
- After changing `prisma/schema.prisma`, run `pnpm prisma generate` and create/apply a migration (`pnpm prisma migrate dev`), then restart `pnpm dev` to pick up the new Prisma client.
- Use Biome for linting and formatting (`pnpm lint`, `pnpm format`).
- Use Vitest for tests (`pnpm test`, `pnpm test:watch`).
- Place authenticated routes under `src/app/(app)/app/**` (e.g., `/app`, `/app/meals`).
- Use Zustand for client-side state management.
- Use TanStack Query for data fetching and caching.
- Perform auth checks in each `/app` page server component (async) and wrap guarded content in `Suspense` to avoid blocking UI while loading.

## AI Agent Notes
- Favor small, reversible changes.
- Update `docs/PLANS.md` when roadmap shifts.
- Run `pnpm format` and `pnpm lint` after making code changes.
- Keep database inspection utilities in `scripts/` for local use only; do not import them into app code.
