import { addDays, format, isSameDay } from "date-fns";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type MealByDay, toDateKey } from "./dashboard-overview-helpers";

export function WeekSnapshotCard({
	mealsByDay,
	weekDays,
}: {
	mealsByDay: Map<string, MealByDay>;
	weekDays: Date[];
}) {
	const recentDays = useMemo(() => {
		const today = new Date();
		const dayOffsets = [0, 1, 2];
		const candidates = dayOffsets
			.map((offset) => addDays(today, offset))
			.map((candidate) => weekDays.find((day) => isSameDay(day, candidate)))
			.filter((day): day is Date => Boolean(day));
		return candidates.length ? candidates : weekDays.slice(0, 3);
	}, [weekDays]);

	return (
		<Card className="border-border bg-card/80">
			<CardHeader>
				<CardTitle className="font-display text-xl text-foreground">
					Week snapshot
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				{recentDays.map((day, index) => {
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
	);
}
