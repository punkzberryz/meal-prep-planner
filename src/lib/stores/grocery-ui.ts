import { addDays, format } from "date-fns";
import { create } from "zustand";
import { toDateKey } from "@/lib/date-keys";
import { getWeekStart } from "@/lib/planner/week";

function buildWeekRange(weekStart: string) {
	const start = new Date(`${weekStart}T00:00:00`);
	if (Number.isNaN(start.getTime())) return "";
	const end = addDays(start, 6);
	return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
}

type GroceryUiState = {
	weekStart: string;
	weekRange: string;
	setWeekStart: (weekStart: string) => void;
	reset: (weekStart: string) => void;
};

const defaultWeekStart = toDateKey(getWeekStart(new Date()));

export const useGroceryUiStore = create<GroceryUiState>((set) => ({
	weekStart: defaultWeekStart,
	weekRange: buildWeekRange(defaultWeekStart),
	setWeekStart: (weekStart) =>
		set({ weekStart, weekRange: buildWeekRange(weekStart) }),
	reset: (weekStart) =>
		set({ weekStart, weekRange: buildWeekRange(weekStart) }),
}));
