"use client";

import { addWeeks, format } from "date-fns";
import { useEffect, useMemo } from "react";
import { GroceryList } from "@/components/grocery/grocery-list";
import { GroceryWeekMeals } from "@/components/grocery/grocery-week-meals";
import { Button } from "@/components/ui/button";
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
	const weekStart = useGroceryUiStore((state) => state.weekStart);

	useEffect(() => {
		const normalized =
			normalizeWeekStartParam(initialWeekStart) ?? currentWeekStartParam;
		setWeekStart(normalized);
	}, [initialWeekStart, currentWeekStartParam, setWeekStart]);

	const weekStartDate = useMemo(
		() => new Date(`${weekStart}T00:00:00`),
		[weekStart],
	);
	const isCurrentWeek = weekStart === currentWeekStartParam;
	const previousWeekParam = useMemo(
		() => format(addWeeks(weekStartDate, -1), "yyyy-MM-dd"),
		[weekStartDate],
	);
	const nextWeekParam = useMemo(
		() => format(addWeeks(weekStartDate, 1), "yyyy-MM-dd"),
		[weekStartDate],
	);

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<div className="flex flex-wrap items-center gap-2 lg:col-span-2 ml-auto">
				<Button
					variant="outline"
					onClick={() => setWeekStart(previousWeekParam)}
				>
					Prev week
				</Button>
				<Button
					variant="outline"
					onClick={() => setWeekStart(currentWeekStartParam)}
					disabled={isCurrentWeek}
				>
					This week
				</Button>
				<Button variant="outline" onClick={() => setWeekStart(nextWeekParam)}>
					Next week
				</Button>
			</div>
			<GroceryList />
			<GroceryWeekMeals />
		</div>
	);
}
