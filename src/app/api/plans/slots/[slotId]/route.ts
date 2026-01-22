import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const PatchBodySchema = z.object({
	mealId: z.string().nullable(),
});

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ slotId: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { slotId } = await params;

	const body = await request.json().catch(() => null);
	const parsedBody = PatchBodySchema.safeParse(body);
	if (!parsedBody.success) {
		return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	}

	const slot = await prisma.planSlot.findUnique({
		where: { id: slotId },
		include: { plan: true },
	});

	if (!slot || slot.plan.userId !== session.userId) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const mealId = parsedBody.data.mealId;
	if (mealId) {
		const meal = await prisma.meal.findFirst({
			where: { id: mealId, userId: session.userId },
			select: { id: true },
		});
		if (!meal) {
			return NextResponse.json({ error: "Invalid mealId" }, { status: 400 });
		}
	}

	const updated = await prisma.$transaction(async (tx) => {
		const next = await tx.planSlot.update({
			where: { id: slotId },
			data: {
				mealId,
				overriddenAt: new Date(),
			},
			include: { meal: { select: { id: true, name: true } } },
		});

		if (mealId) {
			await tx.meal.updateMany({
				where: { id: mealId, userId: session.userId },
				data: { lastPlannedAt: next.date },
			});
		}

		return next;
	});

	return NextResponse.json({
		slot: {
			id: updated.id,
			date: updated.date.toISOString(),
			type: updated.type,
			mealId: updated.mealId,
			meal: updated.meal,
			overriddenAt: updated.overriddenAt?.toISOString() ?? null,
		},
	});
}
