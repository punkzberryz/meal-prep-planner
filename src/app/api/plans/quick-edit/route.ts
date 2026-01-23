import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const QuickEditSchema = z.object({
	updates: z
		.array(
			z.object({
				slotId: z.string(),
				mealId: z.string().nullable(),
			}),
		)
		.min(1),
});

export async function PATCH(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const parsedBody = QuickEditSchema.safeParse(body);
	if (!parsedBody.success) {
		return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	}

	const updates = parsedBody.data.updates;
	const slotIds = updates.map((update) => update.slotId);
	const slots = await prisma.planSlot.findMany({
		where: { id: { in: slotIds } },
		include: { plan: true },
	});

	if (slots.length !== updates.length) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const invalidOwner = slots.some(
		(slot) => slot.plan.userId !== session.userId,
	);
	if (invalidOwner) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const mealIds = updates
		.map((update) => update.mealId)
		.filter((mealId): mealId is string => Boolean(mealId));

	if (mealIds.length > 0) {
		const meals = await prisma.meal.findMany({
			where: { id: { in: mealIds }, userId: session.userId },
			select: { id: true },
		});
		if (meals.length !== new Set(mealIds).size) {
			return NextResponse.json({ error: "Invalid mealId" }, { status: 400 });
		}
	}

	const updatesBySlot = new Map(
		updates.map((update) => [update.slotId, update]),
	);
	const mealDateMap = new Map<string, Date>();

	for (const slot of slots) {
		const update = updatesBySlot.get(slot.id);
		if (!update?.mealId) continue;
		const previous = mealDateMap.get(update.mealId);
		if (!previous || previous < slot.date) {
			mealDateMap.set(update.mealId, slot.date);
		}
	}

	const updatedSlots = await prisma.$transaction(async (tx) => {
		const updated = await Promise.all(
			slots.map((slot) => {
				const update = updatesBySlot.get(slot.id);
				if (!update) return slot;
				return tx.planSlot.update({
					where: { id: slot.id },
					data: {
						mealId: update.mealId,
						overriddenAt: new Date(),
					},
					include: { meal: { select: { id: true, name: true } } },
				});
			}),
		);

		await Promise.all(
			Array.from(mealDateMap.entries()).map(([mealId, date]) =>
				tx.meal.updateMany({
					where: { id: mealId, userId: session.userId },
					data: { lastPlannedAt: date },
				}),
			),
		);

		return updated;
	});

	return NextResponse.json({
		slots: updatedSlots.map((slot) => ({
			id: slot.id,
			date: slot.date.toISOString(),
			type: slot.type,
			mealId: slot.mealId,
			meal: slot.meal,
			overriddenAt: slot.overriddenAt?.toISOString() ?? null,
		})),
	});
}
