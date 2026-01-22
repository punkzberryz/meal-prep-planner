"use client";

import { useEffect, useRef } from "react";
import type { DayButton } from "react-day-picker";
import { getDefaultClassNames } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	getMealColor,
	type MealByDay,
	toDateKey,
} from "./dashboard-overview-helpers";

export function CalendarDayButton({
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
	const isInWeek = modifiers.inWeek ?? true;

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
			data-in-week={isInWeek}
			className={cn(
				"data-[in-week=true]:bg-accent/25 data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex h-full w-full min-h-(--cell-size) flex-col items-center justify-start gap-1 overflow-hidden px-1 py-1 text-center text-xs font-normal leading-none group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md",
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
