"use client";

import { addDays, isWithinInterval } from "date-fns";
import { useEffect, useMemo } from "react";
import {
	fromDateKey,
	type MealByDay,
	toDateKey,
} from "@/components/dashboard/dashboard-overview-helpers";
import { DashboardOverviewLoading } from "@/components/dashboard/dashboard-overview-loading";
import { GroceryPreviewCard } from "@/components/dashboard/grocery-preview-card";
import { MealCalendarCard } from "@/components/dashboard/meal-calendar-card";
import { QuickEditOverlay } from "@/components/dashboard/quick-edit-overlay";
import { SelectedDayCard } from "@/components/dashboard/selected-day-card";
import { WeekSnapshotCard } from "@/components/dashboard/week-snapshot-card";
import { type PlanSlot, useWeekPlan } from "@/lib/queries/plans";
import { usePlannerUiStore } from "@/lib/stores/planner-ui";

export function DashboardOverview() {
	const { data, isLoading, error } = useWeekPlan();
	const { selectedDay, setSelectedDay } = usePlannerUiStore();

	const errorMessage = error
		? error instanceof Error
			? error.message
			: "Failed to load week."
		: null;

	const weekStartDate = useMemo(() => {
		if (!data?.weekStart) return null;
		return new Date(data.weekStart);
	}, [data?.weekStart]);

	useEffect(() => {
		if (!weekStartDate || selectedDay) return;
		const today = new Date();
		const isInWeek = isWithinInterval(today, {
			start: weekStartDate,
			end: addDays(weekStartDate, 6),
		});
		const nextSelected = isInWeek ? today : weekStartDate;
		setSelectedDay(toDateKey(nextSelected));
	}, [weekStartDate, selectedDay, setSelectedDay]);

	const mealsByDay = useMemo(() => {
		const map = new Map<string, MealByDay>();
		for (const slot of data?.plan?.slots ?? []) {
			const key = toDateKey(new Date(slot.date));
			const entry = map.get(key) ?? {};
			if (slot.type === "LUNCH") entry.LUNCH = slot.meal?.name ?? null;
			if (slot.type === "DINNER") entry.DINNER = slot.meal?.name ?? null;
			map.set(key, entry);
		}
		return map;
	}, [data?.plan?.slots]);

	const slotsByDayType = useMemo(() => {
		const map = new Map<string, PlanSlot>();
		for (const slot of data?.plan?.slots ?? []) {
			const key = `${toDateKey(new Date(slot.date))}:${slot.type}`;
			map.set(key, slot);
		}
		return map;
	}, [data?.plan?.slots]);

	const selected = selectedDay ? fromDateKey(selectedDay) : undefined;
	const selectedKey = selected ? toDateKey(selected) : null;
	const selectedMeals = selectedKey ? mealsByDay.get(selectedKey) : undefined;
	const meals = data?.meals ?? [];
	const plan = data?.plan ?? null;

	const weekDays = useMemo(() => {
		if (!weekStartDate) return [];
		return Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
	}, [weekStartDate]);

	const hasPlan = Boolean(plan);
	const selectedLunchSlot = selectedKey
		? slotsByDayType.get(`${selectedKey}:LUNCH`)
		: undefined;
	const selectedDinnerSlot = selectedKey
		? slotsByDayType.get(`${selectedKey}:DINNER`)
		: undefined;

	if (isLoading) {
		return <DashboardOverviewLoading />;
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
			<div className="space-y-6">
				<MealCalendarCard
					hasPlan={hasPlan}
					selected={selected}
					weekStartDate={weekStartDate}
					mealsByDay={mealsByDay}
					onSelect={(date) => setSelectedDay(date ? toDateKey(date) : null)}
				/>

				<WeekSnapshotCard weekDays={weekDays} mealsByDay={mealsByDay} />
			</div>

			<div className="space-y-6">
				<SelectedDayCard
					selected={selected}
					selectedMeals={selectedMeals}
					errorMessage={errorMessage}
				>
					<QuickEditOverlay
						meals={meals}
						plan={plan}
						selected={selected}
						selectedDinnerSlot={selectedDinnerSlot}
						selectedLunchSlot={selectedLunchSlot}
					/>
				</SelectedDayCard>

				<GroceryPreviewCard />
			</div>
		</div>
	);
}
