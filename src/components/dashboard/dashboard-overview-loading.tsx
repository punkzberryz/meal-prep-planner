import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverviewLoading() {
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
