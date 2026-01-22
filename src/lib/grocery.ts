export type GroceryIngredientInput = {
	text: string;
	mealId: string;
	mealName: string;
};

export type GroceryItem = {
	text: string;
	count: number;
	mealIds: string[];
	mealNames: string[];
};

export function aggregateGroceryItems(
	lines: GroceryIngredientInput[],
): GroceryItem[] {
	const byText = new Map<string, GroceryItem>();

	for (const line of lines) {
		const text = line.text.trim();
		if (!text) continue;

		const existing = byText.get(text);
		if (existing) {
			existing.count += 1;
			if (!existing.mealIds.includes(line.mealId)) {
				existing.mealIds.push(line.mealId);
			}
			if (!existing.mealNames.includes(line.mealName)) {
				existing.mealNames.push(line.mealName);
			}
			continue;
		}

		byText.set(text, {
			text,
			count: 1,
			mealIds: [line.mealId],
			mealNames: [line.mealName],
		});
	}

	return Array.from(byText.values());
}
