"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMealDetail } from "@/lib/queries/meals";
import type { PlanSlot } from "@/lib/queries/plans";

type MealDetailPanelProps = {
	label: string;
	slot?: PlanSlot;
};

type SelectedDayMealsCardProps = {
	selectedDate: Date | null;
	selectedLunchSlot?: PlanSlot;
	selectedDinnerSlot?: PlanSlot;
};

export function SelectedDayMealsCard({
	selectedDate,
	selectedLunchSlot,
	selectedDinnerSlot,
}: SelectedDayMealsCardProps) {
	return (
		<Card className="border-border bg-card/70">
			<CardHeader>
				<CardTitle className="font-display text-lg text-foreground">
					{selectedDate
						? `Meals for ${format(selectedDate, "EEEE, MMM d")}`
						: "Selected day"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 text-sm text-foreground">
				<MealDetailPanel label="Lunch" slot={selectedLunchSlot} />
				<MealDetailPanel label="Dinner" slot={selectedDinnerSlot} />
			</CardContent>
		</Card>
	);
}

function MealDetailPanel({ label, slot }: MealDetailPanelProps) {
	const { data, isLoading } = useMealDetail(slot?.mealId ?? null);
	const meal = data?.meal ?? null;
	const ingredients = meal?.ingredients ?? [];

	return (
		<div className="rounded-lg border border-border/60 bg-card/60 p-3">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
						{label}
					</p>
					{isLoading ? (
						<Skeleton className="h-5 w-32" />
					) : (
						<p className="text-base font-medium text-foreground">
							{meal?.name ?? (slot ? "Unassigned" : "Not generated")}
						</p>
					)}
				</div>
				{slot?.overriddenAt ? (
					<span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
						Edited
					</span>
				) : null}
			</div>
			{meal ? (
				<div className="mt-3 space-y-3 text-sm text-muted-foreground">
					{meal.notes ? (
						<div>
							<p className="text-xs uppercase tracking-[0.2em]">Notes</p>
							<p className="text-sm text-foreground/80">{meal.notes}</p>
						</div>
					) : null}
					<div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em]">
						<span>Servings: {meal.servings ?? "—"}</span>
						<span>Ingredients: {ingredients.length}</span>
					</div>
					{ingredients.length > 0 ? (
						<ul className="space-y-1 text-sm text-foreground/80">
							{ingredients.map((ingredient) => (
								<li key={ingredient.id}>{ingredient.text}</li>
							))}
						</ul>
					) : null}
					{meal.tags.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{meal.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground"
								>
									{tag}
								</span>
							))}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
