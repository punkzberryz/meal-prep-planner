"use client";

import { addDays, addWeeks, format, isWithinInterval } from "date-fns";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SelectedDayMealsCard } from "@/components/plans/selected-day-meals-card";
import { WeekPlannerGrid } from "@/components/plans/week-planner-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fromDateKey, toDateKey } from "@/lib/date-keys";
import { getWeekStart } from "@/lib/planner/week";
import {
	type PlanMeal,
	type PlanSlot,
	useGeneratePlan,
	useUpdateSlot,
	useWeekPlan,
	type WeekPlan,
} from "@/lib/queries/plans";

function getWeekStartParam(date: Date) {
	return toDateKey(getWeekStart(date));
}

function normalizeWeekStartParam(value: string | null | undefined) {
	if (!value) return null;
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return null;
	return getWeekStartParam(parsed);
}

type WeekPlannerProps = {
	initialWeekStart?: string | null;
};

export function WeekPlanner({ initialWeekStart }: WeekPlannerProps) {
	const [busySlotId, setBusySlotId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
	const currentWeekStartParam = getWeekStartParam(new Date());
	const [weekStartParam, setWeekStartParam] = useState(() => {
		return normalizeWeekStartParam(initialWeekStart) ?? currentWeekStartParam;
	});

	useEffect(() => {
		const normalized =
			normalizeWeekStartParam(initialWeekStart) ?? currentWeekStartParam;
		setWeekStartParam(normalized);
	}, [initialWeekStart, currentWeekStartParam]);
	const { data, isLoading, error } = useWeekPlan(weekStartParam);
	const generatePlan = useGeneratePlan();
	const updateSlot = useUpdateSlot();

	const plan: WeekPlan | null = data?.plan ?? null;
	const meals: PlanMeal[] = data?.meals ?? [];
	const weekStartDate = useMemo(
		() => new Date(`${weekStartParam}T00:00:00`),
		[weekStartParam],
	);

	const days = useMemo(() => {
		return Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
	}, [weekStartDate]);

	useEffect(() => {
		const today = new Date();
		const start = weekStartDate;
		const end = addDays(weekStartDate, 6);
		const nextSelected = isWithinInterval(today, { start, end })
			? today
			: weekStartDate;
		const nextKey = toDateKey(nextSelected);
		setSelectedDayKey((prev) => (prev === nextKey ? prev : nextKey));
	}, [weekStartDate]);

	const slotsByKey = useMemo(() => {
		const map = new Map<string, PlanSlot>();
		for (const slot of plan?.slots ?? []) {
			const dateKey = toDateKey(new Date(slot.date));
			map.set(`${dateKey}:${slot.type}`, slot);
		}
		return map;
	}, [plan]);

	const selectedDate = useMemo(() => {
		if (!selectedDayKey) return null;
		const parsed = fromDateKey(selectedDayKey);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}, [selectedDayKey]);

	const selectedLunchSlot = selectedDayKey
		? slotsByKey.get(`${selectedDayKey}:LUNCH`)
		: undefined;
	const selectedDinnerSlot = selectedDayKey
		? slotsByKey.get(`${selectedDayKey}:DINNER`)
		: undefined;

	async function handleGenerate(force: boolean) {
		setActionError(null);
		try {
			await generatePlan.mutateAsync({
				weekStart: weekStartParam,
				force,
			});
		} catch (err) {
			setActionError(
				err instanceof Error ? err.message : "Failed to generate plan.",
			);
		}
	}

	function handleWeekChange(nextWeekStart: string) {
		setWeekStartParam(nextWeekStart);
	}

	const isCurrentWeek = weekStartParam === currentWeekStartParam;
	const previousWeekParam = useMemo(
		() => format(addWeeks(weekStartDate, -1), "yyyy-MM-dd"),
		[weekStartDate],
	);
	const nextWeekParam = useMemo(
		() => format(addWeeks(weekStartDate, 1), "yyyy-MM-dd"),
		[weekStartDate],
	);

	async function handleSlotChange(slotId: string, nextMealId: string) {
		setBusySlotId(slotId);
		setActionError(null);
		try {
			await updateSlot.mutateAsync({
				slotId,
				mealId: nextMealId === "" ? null : nextMealId,
			});
		} catch (err) {
			setActionError(
				err instanceof Error ? err.message : "Failed to update slot.",
			);
		} finally {
			setBusySlotId(null);
		}
	}

	const titleRange = useMemo(() => {
		if (days.length === 0) return "";
		const start = days[0];
		const end = days[6];
		return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
	}, [days]);

	if (isLoading) {
		return (
			<Card className="border-border bg-card/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-foreground">
						Weekly plan
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3">
						<div
							aria-hidden="true"
							className="absolute inset-0 opacity-40"
							style={{
								backgroundImage:
									"url('/assets/illustrations/loading-accent.webp')",
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						/>
						<div className="relative space-y-4">
							<Skeleton className="h-10 w-56" />
							<Skeleton className="h-48 w-full" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	const hasMeals = meals.length > 0;
	const hasPlan = Boolean(plan);
	const busyGenerate = generatePlan.isPending;
	const combinedError =
		actionError ?? (error instanceof Error ? error.message : null);

	return (
		<Card className="border-border bg-card/80">
			<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
				<div>
					<CardTitle className="font-display text-xl text-foreground">
						Weekly plan
					</CardTitle>
					<p className="text-sm text-muted-foreground">{titleRange}</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={() => handleWeekChange(previousWeekParam)}
						>
							Prev week
						</Button>
						<Button
							variant="outline"
							onClick={() => handleWeekChange(currentWeekStartParam)}
							disabled={isCurrentWeek}
						>
							This week
						</Button>
						<Button
							variant="outline"
							onClick={() => handleWeekChange(nextWeekParam)}
						>
							Next week
						</Button>
					</div>
					<Button
						disabled={!hasMeals || busyGenerate}
						onClick={() => {
							if (!window.confirm("Overwrite any overrides and regenerate?"))
								return;
							handleGenerate(true);
						}}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						{hasPlan ? "Generate again" : "Generate plan"}
					</Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{combinedError ? (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						{combinedError}
					</div>
				) : null}

				{!hasMeals ? (
					<div className="rounded-lg border border-accent/40 bg-accent/30 px-4 py-3 text-sm text-foreground/80">
						Add a few meals first, then come back to generate a rotation-based
						plan.
					</div>
				) : null}

				{hasMeals && !hasPlan ? (
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-4 text-center sm:flex-row sm:text-left">
						<Image
							src="/assets/illustrations/empty-week.webp"
							alt="Empty week illustration"
							width={240}
							height={240}
							className="h-32 w-32"
						/>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								No plan yet for this week.
							</p>
							<p className="text-sm text-muted-foreground">
								Generate a plan to fill in lunch and dinner slots.
							</p>
						</div>
					</div>
				) : null}

				<WeekPlannerGrid
					days={days}
					selectedDayKey={selectedDayKey}
					setSelectedDayKey={setSelectedDayKey}
					slotsByKey={slotsByKey}
					meals={meals}
					busySlotId={busySlotId}
					hasPlan={hasPlan}
					onSlotChange={handleSlotChange}
				/>

				{selectedDayKey ? (
					<SelectedDayMealsCard
						selectedDate={selectedDate}
						selectedLunchSlot={selectedLunchSlot}
						selectedDinnerSlot={selectedDinnerSlot}
					/>
				) : null}
			</CardContent>
		</Card>
	);
}
