import type { MealSlotType } from "@prisma/client";
import { addDays, startOfDay, startOfWeek } from "date-fns";

export const DEFAULT_WEEK_STARTS_ON = 1 as const; // Monday

export function getWeekStart(date: Date) {
	return startOfDay(
		startOfWeek(date, { weekStartsOn: DEFAULT_WEEK_STARTS_ON }),
	);
}

export function getWeekDays(weekStart: Date) {
	return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export const SLOT_TYPES: MealSlotType[] = ["LUNCH", "DINNER"];
