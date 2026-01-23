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

const CreateMealSchema = z.object({
	name: z.string().min(1),
	notes: z.string().nullable().optional(),
	servings: z.number().int().positive().nullable().optional(),
	ingredients: z.array(IngredientInputSchema).default([]),
	tags: z.array(z.string()).default([]),
});

export async function GET() {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const meals = await prisma.meal.findMany({
		where: { userId: session.userId },
		select: {
			id: true,
			name: true,
			notes: true,
			servings: true,
			lastPlannedAt: true,
			createdAt: true,
			updatedAt: true,
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
		orderBy: [{ name: "asc" }],
	});

	return NextResponse.json({
		meals: meals.map((meal) => ({
			...meal,
			lastPlannedAt: meal.lastPlannedAt?.toISOString() ?? null,
			createdAt: meal.createdAt.toISOString(),
			updatedAt: meal.updatedAt.toISOString(),
			images: meal.images.map((image) => ({
				...image,
				createdAt: image.createdAt.toISOString(),
			})),
			tags: meal.mealTags.map((mt) => mt.tag.value),
		})),
	});
}

export async function POST(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const parsed = CreateMealSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}

	const input = parsed.data;
	const normalizedTags = normalizeTagValues(input.tags);

	const created = await prisma.$transaction(async (tx) => {
		const meal = await tx.meal.create({
			data: {
				userId: session.userId,
				name: input.name.trim(),
				notes: input.notes ? input.notes.trim() : null,
				servings: input.servings ?? null,
				ingredients: {
					create: input.ingredients.map((ing, index) => ({
						position: index,
						text: ing.text.trim(),
						name: ing.name?.trim() || null,
						qty: ing.qty?.trim() || null,
						unit: ing.unit?.trim() || null,
					})),
				},
			},
			select: { id: true },
		});

		if (normalizedTags.length > 0) {
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
						// Keep display value fresh while using valueKey for identity.
						value: tag.value,
					},
					select: { id: true },
				});
				tagIds.push(upserted.id);
			}

			await tx.mealTag.createMany({
				data: tagIds.map((tagId) => ({ mealId: meal.id, tagId })),
			});
		}

		return tx.meal.findUniqueOrThrow({
			where: { id: meal.id },
			select: {
				id: true,
				name: true,
				notes: true,
				servings: true,
				lastPlannedAt: true,
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
				createdAt: true,
				updatedAt: true,
			},
		});
	});

	return NextResponse.json({
		meal: {
			...created,
			lastPlannedAt: created.lastPlannedAt?.toISOString() ?? null,
			createdAt: created.createdAt.toISOString(),
			updatedAt: created.updatedAt.toISOString(),
			images: created.images.map((image) => ({
				...image,
				createdAt: image.createdAt.toISOString(),
			})),
			tags: created.mealTags.map((mt) => mt.tag.value),
		},
	});
}
