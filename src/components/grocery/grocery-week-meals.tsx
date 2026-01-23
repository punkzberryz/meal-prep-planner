"use client";

import Image from "next/image";
import Link from "next/link";
import { GroceryWeekMealsGrid } from "@/components/grocery/grocery-week-meals-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeekPlan } from "@/lib/queries/plans";
import { useGroceryUiStore } from "@/lib/stores/grocery-ui";

const EMPTY_MEALS_IMAGE = "/assets/illustrations/empty-week.webp";

export function GroceryWeekMeals() {
	const weekStart = useGroceryUiStore((state) => state.weekStart);
	const weekRange = useGroceryUiStore((state) => state.weekRange);
	const { data, isLoading, error } = useWeekPlan(weekStart);
	const plan = data?.plan ?? null;

	if (isLoading) {
		return (
			<Card className="border-border bg-card/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-foreground">
						Week meals
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="border-border bg-card/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-foreground">
						Week meals
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						{error instanceof Error ? error.message : "Failed to load meals."}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!plan) {
		return (
			<Card className="border-border bg-card/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-foreground">
						Week meals
					</CardTitle>
					<p className="text-sm text-muted-foreground">{weekRange}</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 text-center">
						<Image
							src={EMPTY_MEALS_IMAGE}
							alt="Empty week illustration"
							width={320}
							height={320}
							className="h-32 w-32"
						/>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								No plan yet for this week.
							</p>
							<p className="text-sm text-muted-foreground">
								Generate a plan to see meals scheduled for the week.
							</p>
						</div>
						<Button asChild className="bg-primary text-primary-foreground">
							<Link href="/app/plans">Go to plans</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-border bg-card/80">
			<CardHeader>
				<CardTitle className="font-display text-xl text-foreground">
					Week meals
				</CardTitle>
				<p className="text-sm text-muted-foreground">{weekRange}</p>
			</CardHeader>
			<CardContent className="space-y-3">
				<GroceryWeekMealsGrid weekStart={weekStart} slots={plan.slots} />
			</CardContent>
		</Card>
	);
}
