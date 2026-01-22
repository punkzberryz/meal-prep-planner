import { expect, test } from "vitest";
import { pickRotationMeals } from "../src/lib/planner/rotation";

test("rotation picks never-planned meals first", () => {
	const meals = [
		{ id: "a", createdAt: new Date("2020-01-01"), lastPlannedAt: new Date("2024-01-10") },
		{ id: "b", createdAt: new Date("2020-01-02"), lastPlannedAt: null },
		{ id: "c", createdAt: new Date("2020-01-03"), lastPlannedAt: new Date("2023-12-01") },
	];

	const picked = pickRotationMeals(meals, 2);
	expect(picked[0]).toBe("b");
	expect(picked[1]).toBe("c");
});

test("rotation avoids duplicates when enough meals exist", () => {
	const meals = Array.from({ length: 10 }, (_, i) => ({
		id: `m${i}`,
		createdAt: new Date(`2020-01-${String(i + 1).padStart(2, "0")}`),
		lastPlannedAt: null,
	}));

	const picked = pickRotationMeals(meals, 7);
	expect(new Set(picked).size).toBe(7);
});

test("rotation repeats when meal count is smaller than slot count", () => {
	const meals = [
		{ id: "a", createdAt: new Date("2020-01-01"), lastPlannedAt: null },
		{ id: "b", createdAt: new Date("2020-01-02"), lastPlannedAt: null },
	];

	const picked = pickRotationMeals(meals, 5);
	expect(picked.filter(Boolean).length).toBe(5);
	expect(new Set(picked).size).toBe(2);
});

