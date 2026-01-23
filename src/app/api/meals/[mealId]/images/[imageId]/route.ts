import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ mealId: string; imageId: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { mealId, imageId } = await params;

	const existingMeal = await prisma.meal.findFirst({
		where: { id: mealId, userId: session.userId },
		select: { id: true },
	});
	if (!existingMeal) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const existingImage = await prisma.mealImage.findFirst({
		where: { id: imageId, mealId },
		select: { id: true },
	});
	if (!existingImage) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	await prisma.$transaction(async (tx) => {
		await tx.mealImage.delete({ where: { id: imageId } });

		const remaining = await tx.mealImage.findMany({
			where: { mealId },
			select: { id: true },
			orderBy: [{ position: "asc" }],
		});

		await Promise.all(
			remaining.map((image, index) =>
				tx.mealImage.update({
					where: { id: image.id },
					data: { position: index },
				}),
			),
		);
	});

	return NextResponse.json({ ok: true });
}
