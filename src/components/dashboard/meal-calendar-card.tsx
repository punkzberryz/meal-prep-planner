import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDayButton } from "./calendar-day-button";
import type { MealByDay } from "./dashboard-overview-helpers";

export function MealCalendarCard({
	hasPlan,
	mealsByDay,
	onSelect,
	selected,
	weekStartDate,
}: {
	hasPlan: boolean;
	mealsByDay: Map<string, MealByDay>;
	onSelect: (date: Date | undefined) => void;
	selected: Date | undefined;
	weekStartDate: Date | null;
}) {
	return (
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
					onSelect={onSelect}
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
	);
}
