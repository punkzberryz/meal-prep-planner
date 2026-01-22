"use client";

import { addDays, format, isWithinInterval, parse } from "date-fns";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { DayButton } from "react-day-picker";
import { getDefaultClassNames } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeekPlan } from "@/lib/queries/plans";
import { usePlannerUiStore } from "@/lib/stores/planner-ui";
import { cn } from "@/lib/utils";

type MealByDay = {
	LUNCH?: string | null;
	DINNER?: string | null;
};

function getMealColor(name: string) {
	const firstChar = name.charAt(0).toUpperCase();
	if (firstChar >= "A" && firstChar <= "E") return "apricot";
	if (firstChar >= "F" && firstChar <= "J") return "coral";
	if (firstChar >= "K" && firstChar <= "O") return "sunny";
	if (firstChar >= "P" && firstChar <= "T") return "mint";
	return "cream";
}

function toDateKey(date: Date) {
	return format(date, "yyyy-MM-dd");
}

function fromDateKey(value: string) {
	return parse(value, "yyyy-MM-dd", new Date());
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	mealsByDay,
	...props
}: React.ComponentProps<typeof DayButton> & {
	mealsByDay: Map<string, MealByDay>;
}) {
	const defaultClassNames = getDefaultClassNames();
	const ref = useRef<HTMLButtonElement>(null);
	const key = toDateKey(day.date);
	const meals = mealsByDay.get(key);
	const labels = [meals?.LUNCH, meals?.DINNER].filter(
		(label): label is string => Boolean(label),
	);

	useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="icon"
			data-day={day.date.toLocaleDateString()}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			className={cn(
				"data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex h-full w-full min-h-(--cell-size) flex-col items-center justify-start gap-1 overflow-hidden px-1 py-1 text-center text-xs font-normal leading-none group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md",
				defaultClassNames.day,
				className,
			)}
			{...props}
		>
			<span className="text-xs font-medium leading-4">
				{day.date.getDate()}
			</span>
			{labels.length ? (
				<>
					{/* Mobile dots view */}
					<div className="mt-1 flex flex-row gap-0.5 sm:hidden">
						{labels.map((label) => (
							<div
								key={label}
								className={cn(
									"size-1 rounded-full",
									getMealColor(label) === "apricot" && "bg-[#fbceb1]",
									getMealColor(label) === "coral" && "bg-[#ff7f50]",
									getMealColor(label) === "sunny" && "bg-[#fef08a]",
									getMealColor(label) === "mint" && "bg-[#d1fae5]",
									getMealColor(label) === "cream" && "bg-[#fff7ed]",
								)}
							/>
						))}
					</div>
					{/* Desktop badges view */}
					<div className="mt-1.5 hidden w-full flex-col gap-1 text-left sm:flex">
						{labels.map((label) => (
							<Badge
								key={label}
								variant={getMealColor(label)}
								className="inline-flex w-full whitespace-nowrap rounded-sm px-1 py-0 text-[9px] font-normal leading-tight"
							>
								<span className="truncate">{label}</span>
							</Badge>
						))}
					</div>
				</>
			) : null}
		</Button>
	);
}

export function DashboardOverview() {
	const { data, isLoading, error } = useWeekPlan();
	const { selectedDay, setSelectedDay } = usePlannerUiStore();

	const weekStartDate = useMemo(() => {
		if (!data?.weekStart) return null;
		return new Date(data.weekStart);
	}, [data?.weekStart]);

	useEffect(() => {
		if (!weekStartDate) return;
		const today = new Date();
		const isInWeek = isWithinInterval(today, {
			start: weekStartDate,
			end: addDays(weekStartDate, 6),
		});
		const nextSelected = isInWeek ? today : weekStartDate;
		const nextKey = toDateKey(nextSelected);
		if (selectedDay !== nextKey) setSelectedDay(nextKey);
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

	const selected = selectedDay ? fromDateKey(selectedDay) : undefined;
	const selectedKey = selected ? toDateKey(selected) : null;
	const selectedMeals = selectedKey ? mealsByDay.get(selectedKey) : undefined;

	const weekDays = useMemo(() => {
		if (!weekStartDate) return [];
		return Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
	}, [weekStartDate]);

	const hasPlan = Boolean(data?.plan);

	if (isLoading) {
		return (
			<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
				<Card className="border-border bg-card/80">
					<CardHeader>
						<CardTitle className="font-display text-xl text-foreground">
							Meal calendar
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-64 w-full" />
					</CardContent>
				</Card>
				<div className="space-y-6">
					<Card className="border-accent/40 bg-card/85">
						<CardHeader>
							<CardTitle className="font-display text-lg text-foreground">
								Selected day
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Skeleton className="h-5 w-3/4" />
							<Skeleton className="h-5 w-2/3" />
							<Skeleton className="h-10 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
			<div className="space-y-6">
				<Card className="border-border bg-card/80">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="font-display text-xl text-foreground">
								Meal calendar
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								Select a day to review lunches and dinners.
							</p>
						</div>
						<span className="rounded-full bg-accent/70 px-3 py-1 text-xs text-foreground">
							{hasPlan ? "Planned" : "Draft week"}
						</span>
					</CardHeader>
					<CardContent>
						<Calendar
							mode="single"
							selected={selected}
							onSelect={(date) => setSelectedDay(date ? toDateKey(date) : null)}
							defaultMonth={weekStartDate ?? undefined}
							className="[--cell-size:--spacing(14)]"
							classNames={{ day: "overflow-hidden" }}
							components={{
								DayButton: (props) => (
									<CalendarDayButton {...props} mealsByDay={mealsByDay} />
								),
							}}
						/>
					</CardContent>
				</Card>

				<Card className="border-border bg-card/80">
					<CardHeader>
						<CardTitle className="font-display text-xl text-foreground">
							Week snapshot
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						{weekDays.slice(0, 3).map((day, index) => {
							const key = toDateKey(day);
							const meals = mealsByDay.get(key);
							return (
								<div key={key} className="space-y-2">
									<div className="flex items-center justify-between">
										<span>{format(day, "EEE")}</span>
										<span>Lunch: {meals?.LUNCH ?? "Unassigned"}</span>
										<span>Dinner: {meals?.DINNER ?? "Unassigned"}</span>
									</div>
									{index < 2 ? <Separator /> : null}
								</div>
							);
						})}
					</CardContent>
				</Card>
			</div>

			<div className="space-y-6">
				<Card className="border-accent/40 bg-card/85">
					<CardHeader>
						<CardTitle className="font-display text-lg text-foreground">
							Selected day
						</CardTitle>
						{selected ? (
							<p className="text-sm text-muted-foreground">
								{format(selected, "EEE, MMM d")}
							</p>
						) : null}
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-foreground/80">
						{error ? (
							<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
								{error instanceof Error
									? error.message
									: "Failed to load week."}
							</div>
						) : null}
						<div className="flex items-center justify-between">
							<span>Lunch</span>
							<span className="font-medium">
								{selectedMeals?.LUNCH ?? "Unassigned"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span>Dinner</span>
							<span className="font-medium">
								{selectedMeals?.DINNER ?? "Unassigned"}
							</span>
						</div>
						<Button asChild variant="outline" className="w-full border-border">
							<Link href="/app/plans">Quick edit</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="border-border bg-card/75">
					<CardHeader>
						<CardTitle className="font-display text-lg text-foreground">
							Grocery list preview
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<div className="flex items-center justify-between">
							<span>Produce</span>
							<span>Spinach, lemons, peppers</span>
						</div>
						<div className="flex items-center justify-between">
							<span>Protein</span>
							<span>Chickpeas, tofu</span>
						</div>
						<div className="flex items-center justify-between">
							<span>Pantry</span>
							<span>Tahini, olive oil</span>
						</div>
						<Button variant="outline" className="w-full border-border">
							Copy list
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
