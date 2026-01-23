import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanSlot } from "@/lib/queries/plans";

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
				<div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
							Lunch
						</p>
						<p className="text-base font-medium text-foreground">
							{selectedLunchSlot?.meal?.name ??
								(selectedLunchSlot ? "Unassigned" : "Not generated")}
						</p>
					</div>
					{selectedLunchSlot?.overriddenAt ? (
						<span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
							Edited
						</span>
					) : null}
				</div>
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
							Dinner
						</p>
						<p className="text-base font-medium text-foreground">
							{selectedDinnerSlot?.meal?.name ??
								(selectedDinnerSlot ? "Unassigned" : "Not generated")}
						</p>
					</div>
					{selectedDinnerSlot?.overriddenAt ? (
						<span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
							Edited
						</span>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}
