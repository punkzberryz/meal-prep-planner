import { fromDateKey, toDateKey } from "@/lib/date-keys";

export type MealByDay = {
	LUNCH?: string | null;
	DINNER?: string | null;
};

export function getMealColor(name: string) {
	const firstChar = name.charAt(0).toUpperCase();
	if (firstChar >= "A" && firstChar <= "E") return "apricot";
	if (firstChar >= "F" && firstChar <= "J") return "coral";
	if (firstChar >= "K" && firstChar <= "O") return "sunny";
	if (firstChar >= "P" && firstChar <= "T") return "mint";
	return "cream";
}

export { toDateKey, fromDateKey };
