# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` uses the Next.js App Router (landing page, auth pages, and API routes).
- `src/components/ui/` holds shadcn/ui components.
- `src/lib/` contains shared utilities (Prisma client, auth helpers, password hashing).
- `prisma/` stores the Prisma schema and migrations.
- `public/` is for static assets.
- `docs/` stores AI-facing planning and rules markdown.

Keep new features in dedicated route segments (e.g., `src/app/(planner)/`).

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (preferred package manager).
- `pnpm dev` — run the local Next.js dev server.
- `pnpm lint` — run Biome checks.
- `pnpm format` — auto-format with Biome.
- `pnpm prisma migrate dev` — apply database migrations to SQLite.
- `pnpm prisma studio` — browse the SQLite database in a UI.
- `pnpm test` — run the Vitest suite.

## Coding Style & Naming Conventions
- TypeScript only; use `PascalCase` for React components and `kebab-case` for route folders.
- Tailwind + shadcn/ui for UI; keep styling in class names where possible.
- Biome handles formatting and linting.
- Keep API handlers in `src/app/api/**/route.ts`.
- Prefer small, composable helpers in `src/lib/` over inline logic.

## Testing Guidelines
Vitest is used for tests.
- Test files live in `tests/**/*.test.ts`.
- Use `pnpm test` for CI-style runs or `pnpm test:watch` during development.

## Commit & Pull Request Guidelines
No repo-specific commit convention yet. Use clear, imperative messages (or Conventional Commits if adopted).

For PRs:
- Describe behavior changes and rationale.
- Link issues when available.
- Include screenshots for UI updates.
- Call out migrations or breaking changes.

## Security & Configuration Notes
- `.env` is ignored; use `.env.example` for required variables.
- Required keys: `DATABASE_URL`, `JWT_SECRET`.
