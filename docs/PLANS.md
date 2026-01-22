# Plans

## Current Phase
- Establish the logged-in app shell (sidebar layout + dashboard calendar).
- Ensure `/app` routes are stable and ready for data wiring.
- Keep future meal planning features modular and layered by route segment.

## Near-Term Roadmap
1. Auth gating: protect `/app` routes and redirect if not signed in.
2. Meal library: CRUD for user meals and seed default meals.
3. Weekly planner: generate daily meal suggestions and allow overrides.
4. Grocery list: aggregate ingredients from the weekly plan.
5. Cooking steps: structured recipe steps with timers and servings.

## Open Decisions
- Tag taxonomy (diet, cuisine, prep time).
- Plan generation rules (random, rotation, user ratings).
