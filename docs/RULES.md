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
- Store auth sessions in SQLite via Prisma; keep auth tokens httpOnly and short-lived (rotate via DB sessions and refresh API).
- Add new data models in `prisma/schema.prisma` with clear relations.
- After changing `prisma/schema.prisma`, run `pnpm prisma generate` and create/apply a migration (`pnpm prisma migrate dev`), then restart `pnpm dev` to pick up the new Prisma client.
- Use Vitest for tests (`pnpm test`, `pnpm test:watch`).
- Place authenticated routes under `src/app/(app)/app/**` (e.g., `/app`, `/app/meals`).
- Use Zustand for client-side state management.
- Use TanStack Query for data fetching and caching.
- Perform auth checks in each `/app` page server component (async) and wrap guarded content in `Suspense` to avoid blocking UI while loading.
- Create dedicated API routes for multi-step UI flows to minimize round trips and speed up mutations.
- Parallelize independent async operations with `Promise.all` only when there are no data dependencies (including within transactions).

## AI Agent Notes
- Favor small, reversible changes.
- Keep database inspection utilities in `scripts/` for local use only; do not import them into app code.
## Skills
- Workflow guidance lives in `/.codex/skills` (format/lint checks, component hygiene, state hygiene, and plans updates).
