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
   - CRUD for user meals (name, notes, ingredients, servings).
   - Optional: seed a small set of default meals (copy into user space).
   - Include: free-form tags; ensure tag value is indexed for search.

2. Weekly planner (v1)
   - Create a weekly plan with per-day meal slots.
   - Generate suggestions via rotation (least-recently-used); allow user edits/overrides after generation.
   - Keep the planner logic isolated behind a small API/helper surface for iteration.

3. Grocery list (v1)
   - Aggregate ingredients from the weekly plan into a single list. (DONE)
   - One-click copy/share (keep UX lightweight). (DONE)

4. Cooking steps (v1)
   - Structured recipe steps with timers and servings.

## Completed
- Auth gating: protect `/app` routes and redirect if not signed in.
- Asset integration: app hero, empty states (meals/plans/grocery), and loading accents wired into the UI.

## Open Decisions
- Ingredient modeling (DECIDED): store a required free-text ingredient line, with optional structured fields (`name`, `qty`, `unit`) for future aggregation/parsing.
