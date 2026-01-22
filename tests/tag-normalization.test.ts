import { expect, test } from "vitest";
import { normalizeTagValues } from "../src/lib/tags";

test("normalizeTagValues trims, lowercases for key, and de-dupes", () => {
	const normalized = normalizeTagValues([
		" Vegetarian ",
		"vegetarian",
		"Quick",
		"",
		"  ",
		"quick ",
	]);

	expect(normalized).toEqual([
		{ value: "Vegetarian", valueKey: "vegetarian" },
		{ value: "Quick", valueKey: "quick" },
	]);
});

