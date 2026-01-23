"use client";

import { format } from "date-fns";
import type { ReactNode } from "react";
import { toDateKey } from "@/lib/date-keys";
import type { PlanMeal, PlanSlot } from "@/lib/queries/plans";
import { cn } from "@/lib/utils";

type WeekPlannerGridProps = {
	days: Date[];
	selectedDayKey: string | null;
	setSelectedDayKey: (dayKey: string) => void;
	slotsByKey: Map<string, PlanSlot>;
	meals: PlanMeal[];
	busySlotId: string | null;
	hasPlan: boolean;
	onSlotChange: (slotId: string, mealId: string) => void;
};

export function WeekPlannerGrid({
	days,
	selectedDayKey,
	setSelectedDayKey,
	slotsByKey,
	meals,
	busySlotId,
	hasPlan,
	onSlotChange,
}: WeekPlannerGridProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
			{days.map((day) => {
				const dayKey = toDateKey(day);
				const isSelected = dayKey === selectedDayKey;
				const lunchSlot = slotsByKey.get(`${dayKey}:LUNCH`);
				const dinnerSlot = slotsByKey.get(`${dayKey}:DINNER`);

				function handleCardClick() {
					setSelectedDayKey(dayKey);
				}

				return (
					<div
						key={dayKey}
						className={cn(
							"relative flex flex-col rounded-lg bg-card/60 cursor-default",
							isSelected &&
								"ring-1 ring-primary/40 shadow-lg shadow-primary/10",
						)}
					>
						<button
							type="button"
							aria-pressed={isSelected}
							onClick={handleCardClick}
							className="absolute inset-0 z-0 rounded-lg"
						>
							<span className="sr-only">Select {format(day, "EEEE")}</span>
						</button>
						<div className="px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
							<button
								type="button"
								onClick={() => setSelectedDayKey(dayKey)}
								className={cn(
									"flex w-full flex-col px-1 py-1 text-left transition",
									isSelected && "text-foreground",
								)}
							>
								<div>{format(day, "EEE")}</div>
								<div className="text-[11px] tracking-[0.12em]">
									{format(day, "MMM d")}
								</div>
							</button>
						</div>
						<div className="space-y-3 px-3 pb-3">
							<button
								type="button"
								onClick={() => setSelectedDayKey(dayKey)}
								className="relative z-10 w-full text-left [&_*]:pointer-events-none [&_select]:pointer-events-auto"
							>
								<SlotBlock
									label="Lunch"
									slot={lunchSlot}
									mealOptions={meals}
									busySlotId={busySlotId}
									hasPlan={hasPlan}
									onSlotChange={onSlotChange}
								/>
							</button>
							<button
								type="button"
								onClick={() => setSelectedDayKey(dayKey)}
								className="relative z-10 w-full text-left [&_*]:pointer-events-none [&_select]:pointer-events-auto"
							>
								<SlotBlock
									label="Dinner"
									slot={dinnerSlot}
									mealOptions={meals}
									busySlotId={busySlotId}
									hasPlan={hasPlan}
									onSlotChange={onSlotChange}
								/>
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}

type SlotBlockProps = {
	label: string;
	slot?: PlanSlot;
	mealOptions: PlanMeal[];
	busySlotId: string | null;
	hasPlan: boolean;
	onSlotChange: (slotId: string, mealId: string) => void;
	footer?: ReactNode;
	className?: string;
};

function SlotBlock({
	label,
	slot,
	mealOptions,
	busySlotId,
	hasPlan,
	onSlotChange,
	footer,
	className,
}: SlotBlockProps) {
	return (
		<div className={cn("space-y-2 cursor-default", className)}>
			<p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
				{label}
			</p>
			{!slot ? (
				<div className="text-xs text-muted-foreground">
					{hasPlan ? "Missing slot" : "Not generated"}
				</div>
			) : (
				<div className="space-y-1">
					<select
						className="w-full rounded-md border border-border bg-white px-2 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
						value={slot.mealId ?? ""}
						disabled={busySlotId === slot.id}
						onChange={(event) => onSlotChange(slot.id, event.target.value)}
					>
						<option value="">Unassigned</option>
						{mealOptions.map((meal) => (
							<option key={meal.id} value={meal.id}>
								{meal.name}
							</option>
						))}
					</select>
					{slot.overriddenAt ? (
						<div className="text-[11px] text-muted-foreground">Edited</div>
					) : null}
					{footer}
				</div>
			)}
		</div>
	);
}
