# Plans

## Current Phase
- Establish the logged-in app shell (sidebar layout + dashboard calendar).
- Keep future meal planning features modular and layered by route segment.

## Near-Term Roadmap
1. Meal library: CRUD for user meals and seed default meals.
2. Weekly planner: generate daily meal suggestions and allow overrides.
3. Grocery list: aggregate ingredients from the weekly plan.
4. Cooking steps: structured recipe steps with timers and servings.
5. Auth gating: protect `/app` routes and redirect if not signed in.

## Open Decisions
- Tag taxonomy (diet, cuisine, prep time).
- Plan generation rules (random, rotation, user ratings).
