import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, expect, test, vi } from "vitest";

let currentUserId = "";

vi.mock("@/lib/session", () => ({
	getSession: vi.fn(async () => ({ userId: currentUserId, jti: "test-jti" })),
}));

const testDbUrl = "file:./test-quick-edit.db";
const testDbPath = path.resolve("test-quick-edit.db");

let prisma: typeof import("@/lib/db").prisma;
let PATCH: typeof import("@/app/api/plans/quick-edit/route").PATCH;

beforeAll(async () => {
	process.env.DATABASE_URL = testDbUrl;
	if (existsSync(testDbPath)) {
		unlinkSync(testDbPath);
	}

	execSync("pnpm prisma migrate deploy", {
		stdio: "inherit",
		env: {
			...process.env,
			DATABASE_URL: testDbUrl,
		},
	});

	(globalThis as { prisma?: unknown }).prisma = undefined;
	vi.resetModules();

	({ prisma } = await import("@/lib/db"));
	({ PATCH } = await import("@/app/api/plans/quick-edit/route"));
});

afterAll(async () => {
	await prisma.$disconnect();
	if (existsSync(testDbPath)) {
		unlinkSync(testDbPath);
	}
});

test("quick-edit returns meal field for each slot", async () => {
	const user = await prisma.user.create({
		data: {
			email: `test-${Date.now()}@example.com`,
			passwordHash: "hash",
		},
	});
	currentUserId = user.id;

	const meal = await prisma.meal.create({
		data: {
			userId: user.id,
			name: "Test meal",
		},
	});

	const plan = await prisma.weeklyPlan.create({
		data: {
			userId: user.id,
			weekStart: new Date("2025-01-06T00:00:00.000Z"),
		},
	});

	const slotWithMeal = await prisma.planSlot.create({
		data: {
			planId: plan.id,
			date: new Date("2025-01-06T00:00:00.000Z"),
			type: "LUNCH",
			mealId: meal.id,
		},
	});

	const slotWithoutMeal = await prisma.planSlot.create({
		data: {
			planId: plan.id,
			date: new Date("2025-01-07T00:00:00.000Z"),
			type: "DINNER",
			mealId: null,
		},
	});

	const request = new Request("http://localhost/api/plans/quick-edit", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			updates: [
				{ slotId: slotWithMeal.id, mealId: meal.id },
				{ slotId: slotWithoutMeal.id, mealId: null },
			],
		}),
	});

	const response = await PATCH(request as never);
	expect(response.status).toBe(200);

	const payload = (await response.json()) as {
		slots: Array<{ id: string; meal: { id: string; name: string } | null }>;
	};

	expect(payload.slots).toHaveLength(2);
	for (const slot of payload.slots) {
		expect(slot).toHaveProperty("meal");
	}

	const mealSlot = payload.slots.find((slot) => slot.id === slotWithMeal.id);
	const emptySlot = payload.slots.find(
		(slot) => slot.id === slotWithoutMeal.id,
	);

	expect(mealSlot?.meal?.id).toBe(meal.id);
	expect(emptySlot?.meal).toBeNull();
});
