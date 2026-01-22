import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getWeekStart } from "@/lib/planner/week";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const WeekQuerySchema = z.object({
	weekStart: z.string().optional(),
});

function parseWeekStart(value: string | undefined) {
	if (!value) return getWeekStart(new Date());

	// Expect YYYY-MM-DD from the UI.
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

	const [plan, meals] = await Promise.all([
		prisma.weeklyPlan.findUnique({
			where: {
				userId_weekStart: { userId: session.userId, weekStart },
			},
			include: {
				slots: {
					include: { meal: { select: { id: true, name: true } } },
					orderBy: [{ date: "asc" }, { type: "asc" }],
				},
			},
		}),
		prisma.meal.findMany({
			where: { userId: session.userId },
			select: { id: true, name: true },
			orderBy: [{ name: "asc" }],
		}),
	]);

	return NextResponse.json({
		weekStart: weekStart.toISOString(),
		plan: plan
			? {
					id: plan.id,
					weekStart: plan.weekStart.toISOString(),
					generatedAt: plan.generatedAt?.toISOString() ?? null,
					slots: plan.slots.map((slot) => ({
						id: slot.id,
						date: slot.date.toISOString(),
						type: slot.type,
						meal: slot.meal,
						mealId: slot.mealId,
						overriddenAt: slot.overriddenAt?.toISOString() ?? null,
					})),
				}
			: null,
		meals,
	});
}
