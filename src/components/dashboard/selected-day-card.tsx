import { format } from "date-fns";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MealByDay } from "./dashboard-overview-helpers";

export function SelectedDayCard({
	children,
	errorMessage,
	selected,
	selectedMeals,
}: {
	children: ReactNode;
	errorMessage: string | null;
	selected: Date | undefined;
	selectedMeals: MealByDay | undefined;
}) {
	return (
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
				{errorMessage ? (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						{errorMessage}
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
				{children}
			</CardContent>
		</Card>
	);
}
