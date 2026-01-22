export function normalizeTagValueKey(value: string) {
	return value.trim().toLowerCase();
}

export function normalizeTagValues(values: string[]) {
	const seen = new Set<string>();
	const result: Array<{ value: string; valueKey: string }> = [];

	for (const raw of values) {
		const value = raw.trim();
		if (!value) continue;
		const valueKey = normalizeTagValueKey(value);
		if (!valueKey) continue;
		if (seen.has(valueKey)) continue;
		seen.add(valueKey);
		result.push({ value, valueKey });
	}

	return result;
}
