import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { pickRotationMeals } from "@/lib/planner/rotation";
import { getWeekDays, getWeekStart, SLOT_TYPES } from "@/lib/planner/week";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const GenerateBodySchema = z.object({
	weekStart: z.string().optional(), // YYYY-MM-DD
	force: z.boolean().optional(),
});

function parseWeekStart(value: string | undefined) {
	if (!value) return getWeekStart(new Date());
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return null;
	return getWeekStart(parsed);
}

export async function POST(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const parsedBody = GenerateBodySchema.safeParse(body);
	if (!parsedBody.success) {
		return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	}

	const weekStart = parseWeekStart(parsedBody.data.weekStart);
	if (!weekStart) {
		return NextResponse.json({ error: "Invalid weekStart" }, { status: 400 });
	}

	const days = getWeekDays(weekStart);
	const slotCount = days.length * SLOT_TYPES.length;
	const force = parsedBody.data.force ?? false;

	const meals = await prisma.meal.findMany({
		where: { userId: session.userId },
		select: { id: true, createdAt: true, lastPlannedAt: true },
	});

	const pickedMealIds = pickRotationMeals(meals, slotCount);
	const now = new Date();

	const plan = await prisma.$transaction(async (tx) => {
		const existingSlots =
			(
				await tx.weeklyPlan.findUnique({
					where: {
						userId_weekStart: { userId: session.userId, weekStart },
					},
					select: {
						slots: {
							select: {
								date: true,
								type: true,
								mealId: true,
								overriddenAt: true,
							},
						},
					},
				})
			)?.slots ?? [];

		const existingSlotByKey = new Map<
			string,
			{
				mealId: string | null;
				overriddenAt: Date | null;
			}
		>();

		for (const slot of existingSlots) {
			existingSlotByKey.set(`${slot.date.toISOString()}:${slot.type}`, {
				mealId: slot.mealId,
				overriddenAt: slot.overriddenAt,
			});
		}

		const upserted = await tx.weeklyPlan.upsert({
			where: { userId_weekStart: { userId: session.userId, weekStart } },
			create: { userId: session.userId, weekStart, generatedAt: now },
			update: { generatedAt: now },
		});

		const mealLastPlannedById = new Map<string, Date>();

		let index = 0;
		for (const date of days) {
			for (const type of SLOT_TYPES) {
				const existing = existingSlotByKey.get(`${date.toISOString()}:${type}`);
				const nextMealId = pickedMealIds[index] ?? null;
				index += 1;

				// Preserve user overrides unless we explicitly force a full overwrite.
				if (!force && existing?.overriddenAt) {
					if (existing.mealId) {
						const current = mealLastPlannedById.get(existing.mealId);
						if (!current || current < date) {
							mealLastPlannedById.set(existing.mealId, date);
						}
					}
					continue;
				}

				await tx.planSlot.upsert({
					where: {
						planId_date_type: { planId: upserted.id, date, type },
					},
					create: {
						planId: upserted.id,
						date,
						type,
						mealId: nextMealId,
						overriddenAt: null,
					},
					update: {
						mealId: nextMealId,
						overriddenAt: null,
					},
				});

				if (nextMealId) {
					const current = mealLastPlannedById.get(nextMealId);
					if (!current || current < date) {
						mealLastPlannedById.set(nextMealId, date);
					}
				}
			}
		}

		for (const [mealId, lastPlannedAt] of mealLastPlannedById.entries()) {
			await tx.meal.updateMany({
				where: { id: mealId, userId: session.userId },
				data: { lastPlannedAt },
			});
		}

		return tx.weeklyPlan.findUniqueOrThrow({
			where: { id: upserted.id },
			include: {
				slots: {
					include: { meal: { select: { id: true, name: true } } },
					orderBy: [{ date: "asc" }, { type: "asc" }],
				},
			},
		});
	});

	return NextResponse.json({
		plan: {
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
		},
	});
}
