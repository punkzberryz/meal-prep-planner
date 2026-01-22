# Plans

## Current Phase
- Establish the logged-in app shell (sidebar layout + dashboard calendar scaffold).
- Stabilize `/app/**` route patterns and auth gating so feature work is incremental.
- Keep future meal planning features modular and layered by route segment.

### Definition of Done (Current Phase)
- `/app` loads with a consistent sidebar layout and a dashboard landing page.
- Auth checks are performed in each `/app` page server component (redirect when signed out).
- Navigation structure is in place for upcoming sections (Meals, Planner, Grocery List), including a placeholder `/app/grocery` route.
- Dashboard calendar scaffold renders a real week grid (can be empty) with a clear empty state.
- UI is responsive and calm (no dense dashboard); guarded content is wrapped in `Suspense` (with skeletons) to avoid blocking.
- Routes and component boundaries are set so wiring data later does not require rewrites.

## Near-Term Roadmap
0. Decision checkpoints (unblockers)
   - Tag taxonomy MVP (DECIDED): free-form tags (string values); DB index on tag value for search (consider `userId + value` uniqueness).
   - Plan generation v1 (DECIDED): rotation (least-recently-used) with user overrides; requires persisting usage metadata.

1. Meal library (v1)
   - Optional: seed a small set of default meals (copy into user space).

2. Weekly planner (v1)
   - Keep the planner logic isolated behind a small API/helper surface for iteration.
   - Allow navigating to previous and future weeks in `/app/plans`.

3. Grocery list (v1)
   - No further items listed.

4. Cooking steps (v1)
   - Structured recipe steps with timers and servings.

## Near-Term Additions
1. Auth-aware marketing flow
   - Redirect authenticated users away from `/login` and `/register`.
   - Swap the landing page "Sign in" CTA to "Go to app" when signed in.
2. App-wide UX scaffolding
   - Add a not-found page.
   - Add a global error boundary page.
   - Add a loading UI page.
3. Dashboard scope (selected)
   - Today’s plan summary (lunch/dinner cards, quick edit).
   - Week snapshot (mini calendar or week grid with meal names).
   - Grocery list preview (top items + copy).
   - Upcoming week navigation (prev/next week).
   - Enhance the meal calendar to show meal info, not just dates.

## Completed
- Auth gating: protect `/app` routes and redirect if not signed in.
- Asset integration: app hero, empty states (meals/plans/grocery), and loading accents wired into the UI.
- Meal library (v1): CRUD for meals, ingredients, servings, tags.
- Weekly planner (v1): week slots, rotation-based generation, slot edits.
- Grocery list (v1): aggregated ingredient list with one-click copy.
- Data fetching + client state simplification: TanStack Query hooks and Zustand stores wired across meals/plans/grocery/auth.
- Dashboard date selection: parse local date keys to avoid timezone shifts.
- Auth cache refresh: update `auth.me` after login/register for immediate sidebar sync.
- Auth session refresh: poll `/api/auth/refresh` every 30 minutes when signed in.

## Open Decisions
- Ingredient modeling (DECIDED): store a required free-text ingredient line, with optional structured fields (`name`, `qty`, `unit`) for future aggregation/parsing.
