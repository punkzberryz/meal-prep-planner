"use client";

import { addDays, format } from "date-fns";
import { toDateKey } from "@/lib/date-keys";
import type { PlanSlot } from "@/lib/queries/plans";
import { cn } from "@/lib/utils";

type GroceryWeekMealsGridProps = {
	weekStart: string;
	slots: PlanSlot[];
};

export function GroceryWeekMealsGrid({
	weekStart,
	slots,
}: GroceryWeekMealsGridProps) {
	const weekStartDate = new Date(`${weekStart}T00:00:00`);
	const days = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
	const slotsByKey = new Map<string, PlanSlot>();

	for (const slot of slots) {
		const dateKey = toDateKey(new Date(slot.date));
		slotsByKey.set(`${dateKey}:${slot.type}`, slot);
	}

	return (
		<div className="grid grid-cols-2 gap-3">
			{days.map((day) => {
				const dayKey = toDateKey(day);
				const lunchSlot = slotsByKey.get(`${dayKey}:LUNCH`);
				const dinnerSlot = slotsByKey.get(`${dayKey}:DINNER`);

				return (
					<div key={dayKey} className="rounded-lg bg-card/60">
						<div className="px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
							<div className="flex flex-col px-1 py-1 text-left">
								<div>{format(day, "EEE")}</div>
								<div className="text-[11px] tracking-[0.12em]">
									{format(day, "MMM d")}
								</div>
							</div>
						</div>
						<div className="space-y-3 px-3 pb-3">
							<MealSlot label="Lunch" slot={lunchSlot} />
							<MealSlot label="Dinner" slot={dinnerSlot} />
						</div>
					</div>
				);
			})}
		</div>
	);
}

type MealSlotProps = {
	label: string;
	slot?: PlanSlot;
};

function MealSlot({ label, slot }: MealSlotProps) {
	return (
		<div className="space-y-2">
			<p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
				{label}
			</p>
			<div
				className={cn(
					"rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm",
					!slot?.meal && "text-muted-foreground",
				)}
			>
				{slot?.meal?.name ?? "Unassigned"}
			</div>
			{slot?.overriddenAt ? (
				<div className="text-[11px] text-muted-foreground">Edited</div>
			) : null}
		</div>
	);
}
