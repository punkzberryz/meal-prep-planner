import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { aggregateGroceryItems } from "@/lib/grocery";
import { getWeekStart } from "@/lib/planner/week";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const WeekQuerySchema = z.object({
	weekStart: z.string().optional(),
});

function parseWeekStart(value: string | undefined) {
	if (!value) return getWeekStart(new Date());

	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return null;
	return getWeekStart(parsed);
}

export async function GET(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(request.url);
	const parsedQuery = WeekQuerySchema.safeParse({
		weekStart: url.searchParams.get("weekStart") ?? undefined,
	});

	if (!parsedQuery.success) {
		return NextResponse.json({ error: "Invalid query" }, { status: 400 });
	}

	const weekStart = parseWeekStart(parsedQuery.data.weekStart);
	if (!weekStart) {
		return NextResponse.json({ error: "Invalid weekStart" }, { status: 400 });
	}

	const plan = await prisma.weeklyPlan.findUnique({
		where: { userId_weekStart: { userId: session.userId, weekStart } },
		include: {
			slots: {
				include: {
					meal: {
						select: {
							id: true,
							name: true,
							ingredients: { select: { text: true } },
						},
					},
				},
				orderBy: [{ date: "asc" }, { type: "asc" }],
			},
		},
	});

	const inputs = plan
		? plan.slots.flatMap((slot) => {
				const meal = slot.meal;
				if (!meal) return [];
				return meal.ingredients.map((ingredient) => ({
					text: ingredient.text,
					mealId: meal.id,
					mealName: meal.name,
				}));
			})
		: [];

	const items = aggregateGroceryItems(inputs);

	return NextResponse.json({
		weekStart: weekStart.toISOString(),
		plan: plan
			? {
					id: plan.id,
					generatedAt: plan.generatedAt?.toISOString() ?? null,
					slotCount: plan.slots.length,
				}
			: null,
		items,
	});
}
