"use client";

import { useEffect } from "react";
import { GroceryList } from "@/components/grocery/grocery-list";
import { GroceryWeekMeals } from "@/components/grocery/grocery-week-meals";
import { toDateKey } from "@/lib/date-keys";
import { getWeekStart } from "@/lib/planner/week";
import { useGroceryUiStore } from "@/lib/stores/grocery-ui";

function getWeekStartParam(date: Date) {
	return toDateKey(getWeekStart(date));
}

function normalizeWeekStartParam(value: string | null | undefined) {
	if (!value) return null;
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return null;
	return getWeekStartParam(parsed);
}

type GroceryWeekViewProps = {
	initialWeekStart?: string | null;
};

export function GroceryWeekView({ initialWeekStart }: GroceryWeekViewProps) {
	const currentWeekStartParam = getWeekStartParam(new Date());
	const setWeekStart = useGroceryUiStore((state) => state.setWeekStart);

	useEffect(() => {
		const normalized =
			normalizeWeekStartParam(initialWeekStart) ?? currentWeekStartParam;
		setWeekStart(normalized);
	}, [initialWeekStart, currentWeekStartParam, setWeekStart]);

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<GroceryList />
			<GroceryWeekMeals />
		</div>
	);
}
