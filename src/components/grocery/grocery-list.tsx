"use client";

import { addWeeks, format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toDateKey } from "@/lib/date-keys";
import { getWeekStart } from "@/lib/planner/week";
import { useGroceryList } from "@/lib/queries/grocery";
import { useGroceryUiStore } from "@/lib/stores/grocery-ui";

function buildCopyText(items: { text: string; count: number }[]) {
	return items
		.map((item) =>
			item.count > 1 ? `${item.text} (x${item.count})` : item.text,
		)
		.join("\n");
}

async function copyToClipboard(text: string) {
	if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return;
	}

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.style.position = "fixed";
	textarea.style.opacity = "0";
	document.body.appendChild(textarea);
	textarea.select();
	document.execCommand("copy");
	document.body.removeChild(textarea);
}

function getWeekStartParam(date: Date) {
	return toDateKey(getWeekStart(date));
}

export function GroceryList() {
	const [copyStatus, setCopyStatus] = useState<"idle" | "done" | "error">(
		"idle",
	);
	const weekStart = useGroceryUiStore((state) => state.weekStart);
	const weekRange = useGroceryUiStore((state) => state.weekRange);
	const setWeekStart = useGroceryUiStore((state) => state.setWeekStart);
	const currentWeekStartParam = getWeekStartParam(new Date());
	const { data, isLoading, error } = useGroceryList(weekStart);

	const weekStartDate = useMemo(
		() => new Date(`${weekStart}T00:00:00`),
		[weekStart],
	);

	const hasPlan = Boolean(data?.plan);
	const items = data?.items ?? [];
	const isCurrentWeek = weekStart === currentWeekStartParam;
	const previousWeekParam = useMemo(
		() => format(addWeeks(weekStartDate, -1), "yyyy-MM-dd"),
		[weekStartDate],
	);
	const nextWeekParam = useMemo(
		() => format(addWeeks(weekStartDate, 1), "yyyy-MM-dd"),
		[weekStartDate],
	);

	async function handleCopy() {
		if (items.length === 0) return;
		try {
			await copyToClipboard(buildCopyText(items));
			setCopyStatus("done");
			toast.success("Grocery list copied.");
			window.setTimeout(() => setCopyStatus("idle"), 1500);
		} catch {
			setCopyStatus("error");
			toast.error("Copy failed.");
			window.setTimeout(() => setCopyStatus("idle"), 1500);
		}
	}

	if (isLoading) {
		return (
			<Card className="border-border bg-card/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-foreground">
						Grocery list
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="border-border bg-card/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-foreground">
						Grocery list
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						{error instanceof Error ? error.message : "Failed to load grocery."}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-border bg-card/80">
			<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
				<div>
					<CardTitle className="font-display text-xl text-foreground">
						Grocery list
					</CardTitle>
					<p className="text-sm text-muted-foreground">{weekRange}</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={() => setWeekStart(previousWeekParam)}
						>
							Prev week
						</Button>
						<Button
							variant="outline"
							onClick={() => setWeekStart(currentWeekStartParam)}
							disabled={isCurrentWeek}
						>
							This week
						</Button>
						<Button
							variant="outline"
							onClick={() => setWeekStart(nextWeekParam)}
						>
							Next week
						</Button>
					</div>
					<Button
						onClick={handleCopy}
						className="bg-primary text-primary-foreground"
						disabled={!hasPlan || items.length === 0}
					>
						{copyStatus === "done"
							? "Copied"
							: copyStatus === "error"
								? "Copy failed"
								: "Copy list"}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{!hasPlan ? (
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 text-center">
						<Image
							src="/assets/illustrations/empty-grocery.webp"
							alt="Empty grocery list illustration"
							width={320}
							height={320}
							className="h-40 w-40"
						/>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								No grocery list yet.
							</p>
							<p className="text-sm text-muted-foreground">
								Generate a plan first to build your shopping list.
							</p>
						</div>
						<Button asChild className="bg-primary text-primary-foreground">
							<Link href="/app/plans">Go to plans</Link>
						</Button>
					</div>
				) : items.length === 0 ? (
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 text-center">
						<Image
							src="/assets/illustrations/empty-grocery.webp"
							alt="Empty grocery list illustration"
							width={320}
							height={320}
							className="h-40 w-40"
						/>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								No ingredients yet.
							</p>
							<p className="text-sm text-muted-foreground">
								Add ingredients to meals to see them here.
							</p>
						</div>
						<Button asChild variant="outline">
							<Link href="/app/meals">Edit meals</Link>
						</Button>
					</div>
				) : (
					<>
						<p className="text-sm text-muted-foreground">
							{items.length} items collected from this week's plan.
						</p>
						<ul className="space-y-2">
							{items.map((item) => (
								<li
									key={item.text}
									className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-white/70 px-3 py-2 text-sm text-foreground shadow-sm"
								>
									<span>{item.text}</span>
									{item.count > 1 ? (
										<span className="rounded-full bg-accent/60 px-2 py-0.5 text-xs text-foreground">
											x{item.count}
										</span>
									) : null}
								</li>
							))}
						</ul>
					</>
				)}
			</CardContent>
		</Card>
	);
}
