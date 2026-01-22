import { expect, test } from "vitest";
import { aggregateGroceryItems } from "../src/lib/grocery";

test("grocery aggregation trims and skips empty lines", () => {
	const items = aggregateGroceryItems([
		{ text: "  1 can chickpeas  ", mealId: "m1", mealName: "Bowl" },
		{ text: "   ", mealId: "m1", mealName: "Bowl" },
	]);

	expect(items).toHaveLength(1);
	expect(items[0]?.text).toBe("1 can chickpeas");
});

test("grocery aggregation de-dupes exact matches only", () => {
	const items = aggregateGroceryItems([
		{ text: "2 lemons", mealId: "m1", mealName: "Salad" },
		{ text: "2 lemons", mealId: "m2", mealName: "Pasta" },
		{ text: "2 Lemons", mealId: "m3", mealName: "Soup" },
	]);

	expect(items).toHaveLength(2);
	const exact = items.find((item) => item.text === "2 lemons");
	const different = items.find((item) => item.text === "2 Lemons");
	expect(exact?.count).toBe(2);
	expect(different?.count).toBe(1);
});

test("grocery aggregation tracks distinct meal sources", () => {
	const items = aggregateGroceryItems([
		{ text: "Olive oil", mealId: "m1", mealName: "Salad" },
		{ text: "Olive oil", mealId: "m1", mealName: "Salad" },
		{ text: "Olive oil", mealId: "m2", mealName: "Pasta" },
	]);

	const olive = items[0];
	expect(olive?.count).toBe(3);
	expect(olive?.mealIds).toEqual(["m1", "m2"]);
	expect(olive?.mealNames).toEqual(["Salad", "Pasta"]);
});
