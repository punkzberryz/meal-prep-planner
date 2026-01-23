import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const CreateMealImageSchema = z.object({
	url: z.string().url(),
});

const ReorderMealImagesSchema = z.object({
	orderedIds: z.array(z.string().min(1)).min(1),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ mealId: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { mealId } = await params;

	const body = await request.json().catch(() => null);
	const parsed = CreateMealImageSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}

	const existingMeal = await prisma.meal.findFirst({
		where: { id: mealId, userId: session.userId },
		select: { id: true },
	});
	if (!existingMeal) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const image = await prisma.$transaction(async (tx) => {
		const maxPosition = await tx.mealImage.aggregate({
			where: { mealId },
			_max: { position: true },
		});
		const nextPosition = (maxPosition._max.position ?? -1) + 1;

		return tx.mealImage.create({
			data: {
				mealId,
				url: parsed.data.url.trim(),
				position: nextPosition,
			},
			select: {
				id: true,
				url: true,
				position: true,
				createdAt: true,
			},
		});
	});

	return NextResponse.json({
		image: { ...image, createdAt: image.createdAt.toISOString() },
	});
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ mealId: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { mealId } = await params;

	const body = await request.json().catch(() => null);
	const parsed = ReorderMealImagesSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}

	const existingMeal = await prisma.meal.findFirst({
		where: { id: mealId, userId: session.userId },
		select: { id: true },
	});
	if (!existingMeal) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const orderedIds = parsed.data.orderedIds;
	const uniqueIds = new Set(orderedIds);
	if (uniqueIds.size !== orderedIds.length) {
		return NextResponse.json({ error: "Duplicate ids" }, { status: 400 });
	}

	const images = await prisma.mealImage.findMany({
		where: { mealId },
		select: { id: true },
	});
	if (images.length !== orderedIds.length) {
		return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
	}
	const allowedIds = new Set(images.map((image) => image.id));
	for (const id of orderedIds) {
		if (!allowedIds.has(id)) {
			return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
		}
	}

	await prisma.$transaction(async (tx) => {
		await tx.mealImage.updateMany({
			where: { mealId },
			data: { position: { increment: 1000 } },
		});

		await Promise.all(
			orderedIds.map((id, index) =>
				tx.mealImage.update({
					where: { id },
					data: { position: index },
				}),
			),
		);
	});

	const updated = await prisma.mealImage.findMany({
		where: { mealId },
		select: {
			id: true,
			url: true,
			position: true,
			createdAt: true,
		},
		orderBy: [{ position: "asc" }],
	});

	return NextResponse.json({
		images: updated.map((image) => ({
			...image,
			createdAt: image.createdAt.toISOString(),
		})),
	});
}
