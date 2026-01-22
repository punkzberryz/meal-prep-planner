# Plans

## Current Phase
- Post-v1 polish: strengthen the weekly planning workflow and meal data quality.
- Ship small improvements that keep the planner modular and easy to extend.
- Optimize UI state ownership to reduce unnecessary re-renders across the app.
- Evaluate API optimization opportunities (dedicated routes for multi-step flows).

### Definition of Done (Current Phase)
- Planner navigation supports previous and future weeks in `/app/plans`.
- Optional starter meals can be seeded into each user workspace.
- Cooking steps v1 is modeled and editable (timers, servings).
- Dashboard polish remains responsive and calm; no regressions in layout or auth gating.

## Near-Term Roadmap
0. Decision checkpoints (unblockers)
   - Tag taxonomy MVP (DECIDED): free-form tags (string values); DB index on tag value for search (consider `userId + value` uniqueness).
   - Plan generation v1 (DECIDED): rotation (least-recently-used) with user overrides; requires persisting usage metadata.

1. Meal library enhancements
   - Optional: seed a small set of default meals (copy into user space).
   - Meal tagging and search polish.

2. Weekly planner enhancements
   - Keep the planner logic isolated behind a small API/helper surface for iteration.
   - Allow navigating to previous and future weeks in `/app/plans`.

3. Grocery list enhancements
   - No further items listed.

4. Cooking steps (v1)
   - Structured recipe steps with timers and servings.

## Completed
- Auth gating: protect `/app` routes and redirect if not signed in.
- Auth-aware marketing flow: redirect signed-in users away from `/login` and `/register`, swap landing CTA to "Go to app".
- App-wide UX scaffolding: not-found, error boundary, and loading pages.
- Asset integration: app hero, empty states (meals/plans/grocery), and loading accents wired into the UI.
- Meal library (v1): CRUD for meals, ingredients, servings, tags.
- Weekly planner (v1): week slots, rotation-based generation, slot edits.
- Grocery list (v1): aggregated ingredient list with one-click copy.
- Data fetching + client state simplification: TanStack Query hooks and Zustand stores wired across meals/plans/grocery/auth.
- Dashboard date selection: parse local date keys to avoid timezone shifts.
- Dashboard quick edit: responsive dialog/drawer to update selected day meals.
- Dashboard enhancements: selected day summary card, week snapshot, grocery list preview, and meal labels in calendar.
- Dashboard calendar: week range label and in-week day highlight for clarity.
- Auth cache refresh: update `auth.me` after login/register for immediate sidebar sync.
- Auth session refresh: poll `/api/auth/refresh` every 30 minutes when signed in.

## Decisions (Closed)
- Ingredient modeling: store a required free-text ingredient line, with optional structured fields (`name`, `qty`, `unit`) for future aggregation/parsing.
