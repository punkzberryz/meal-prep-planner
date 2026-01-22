export type RotationMeal = {
	id: string;
	createdAt: Date;
	lastPlannedAt: Date | null;
};

function toSortableTime(date: Date | null) {
	// Null means "never planned", which should come first.
	return date ? date.getTime() : -1;
}

export function pickRotationMeals(
	meals: RotationMeal[],
	slotCount: number,
): Array<string | null> {
	if (slotCount <= 0) return [];
	if (meals.length === 0) return Array.from({ length: slotCount }, () => null);

	const sorted = [...meals].sort((a, b) => {
		const byLastPlanned =
			toSortableTime(a.lastPlannedAt) - toSortableTime(b.lastPlannedAt);
		if (byLastPlanned !== 0) return byLastPlanned;
		return a.createdAt.getTime() - b.createdAt.getTime();
	});

	const used = new Set<string>();
	const result: Array<string | null> = [];

	let cursor = 0;
	for (let i = 0; i < slotCount; i += 1) {
		let picked: string | null = null;

		// Pass 1: prefer unique meals within the generated week.
		for (; cursor < sorted.length; cursor += 1) {
			const candidate = sorted[cursor]?.id;
			if (!candidate) continue;
			if (used.has(candidate)) continue;
			picked = candidate;
			cursor += 1;
			break;
		}

		// Pass 2: if we ran out of unique meals, allow repeats.
		if (!picked) {
			const fallback = sorted[i % sorted.length]?.id ?? null;
			picked = fallback;
		}

		result.push(picked);
		if (picked) used.add(picked);
	}

	return result;
}
