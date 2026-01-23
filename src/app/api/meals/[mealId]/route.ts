import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { normalizeTagValues } from "@/lib/tags";

export const runtime = "nodejs";

const IngredientInputSchema = z.object({
	text: z.string().min(1),
	name: z.string().min(1).optional(),
	qty: z.string().min(1).optional(),
	unit: z.string().min(1).optional(),
});

const UpdateMealSchema = z.object({
	name: z.string().min(1).optional(),
	notes: z.string().optional().nullable(),
	servings: z.number().int().positive().optional().nullable(),
	ingredients: z.array(IngredientInputSchema).optional(),
	tags: z.array(z.string()).optional(),
});

function toMealResponse(meal: {
	id: string;
	name: string;
	notes: string | null;
	servings: number | null;
	lastPlannedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	ingredients: Array<{
		id: string;
		position: number;
		text: string;
		name: string | null;
		qty: string | null;
		unit: string | null;
	}>;
	images: Array<{
		id: string;
		url: string;
		position: number;
		createdAt: Date;
	}>;
	mealTags: Array<{ tag: { id: string; value: string } }>;
}) {
	return {
		...meal,
		lastPlannedAt: meal.lastPlannedAt?.toISOString() ?? null,
		createdAt: meal.createdAt.toISOString(),
		updatedAt: meal.updatedAt.toISOString(),
		images: meal.images.map((image) => ({
			...image,
			createdAt: image.createdAt.toISOString(),
		})),
		tags: meal.mealTags.map((mt) => mt.tag.value),
	};
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ mealId: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { mealId } = await params;

	const meal = await prisma.meal.findFirst({
		where: { id: mealId, userId: session.userId },
		select: {
			id: true,
			name: true,
			notes: true,
			servings: true,
			lastPlannedAt: true,
			createdAt: true,
			updatedAt: true,
			ingredients: {
				select: {
					id: true,
					position: true,
					text: true,
					name: true,
					qty: true,
					unit: true,
				},
				orderBy: [{ position: "asc" }],
			},
			images: {
				select: {
					id: true,
					url: true,
					position: true,
					createdAt: true,
				},
				orderBy: [{ position: "asc" }],
			},
			mealTags: { select: { tag: { select: { id: true, value: true } } } },
		},
	});

	if (!meal) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json({ meal: toMealResponse(meal) });
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
	const parsed = UpdateMealSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}

	const existing = await prisma.meal.findFirst({
		where: { id: mealId, userId: session.userId },
		select: { id: true },
	});
	if (!existing) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const input = parsed.data;
	const normalizedTags = input.tags ? normalizeTagValues(input.tags) : null;

	const updated = await prisma.$transaction(async (tx) => {
		await tx.meal.update({
			where: { id: mealId },
			data: {
				name: input.name ? input.name.trim() : undefined,
				notes:
					input.notes === undefined
						? undefined
						: input.notes
							? input.notes.trim()
							: null,
				servings: input.servings === undefined ? undefined : input.servings,
			},
			select: { id: true },
		});

		if (input.ingredients) {
			await tx.mealIngredient.deleteMany({ where: { mealId } });
			await tx.mealIngredient.createMany({
				data: input.ingredients.map((ing, index) => ({
					mealId,
					position: index,
					text: ing.text.trim(),
					name: ing.name?.trim() || null,
					qty: ing.qty?.trim() || null,
					unit: ing.unit?.trim() || null,
				})),
			});
		}

		if (normalizedTags) {
			await tx.mealTag.deleteMany({ where: { mealId } });

			const tagIds: string[] = [];
			for (const tag of normalizedTags) {
				const upserted = await tx.tag.upsert({
					where: {
						userId_valueKey: {
							userId: session.userId,
							valueKey: tag.valueKey,
						},
					},
					create: {
						userId: session.userId,
						value: tag.value,
						valueKey: tag.valueKey,
					},
					update: {
						value: tag.value,
					},
					select: { id: true },
				});
				tagIds.push(upserted.id);
			}

			if (tagIds.length > 0) {
				await tx.mealTag.createMany({
					data: tagIds.map((tagId) => ({ mealId, tagId })),
				});
			}
		}

		const meal = await tx.meal.findUniqueOrThrow({
			where: { id: mealId },
			select: {
				id: true,
				name: true,
				notes: true,
				servings: true,
				lastPlannedAt: true,
				createdAt: true,
				updatedAt: true,
				ingredients: {
					select: {
						id: true,
						position: true,
						text: true,
						name: true,
						qty: true,
						unit: true,
					},
					orderBy: [{ position: "asc" }],
				},
				images: {
					select: {
						id: true,
						url: true,
						position: true,
						createdAt: true,
					},
					orderBy: [{ position: "asc" }],
				},
				mealTags: { select: { tag: { select: { id: true, value: true } } } },
			},
		});

		return meal;
	});

	return NextResponse.json({ meal: toMealResponse(updated) });
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ mealId: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { mealId } = await params;

	const existing = await prisma.meal.findFirst({
		where: { id: mealId, userId: session.userId },
		select: { id: true },
	});
	if (!existing) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	await prisma.meal.delete({ where: { id: mealId } });
	return NextResponse.json({ ok: true });
}
