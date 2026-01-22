"use client";

import { addDays, format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroceryList } from "@/lib/queries/grocery";

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

export function GroceryList() {
	const [copyStatus, setCopyStatus] = useState<"idle" | "done" | "error">(
		"idle",
	);
	const { data, isLoading, error } = useGroceryList();

	const weekRange = useMemo(() => {
		if (!data?.weekStart) return "";
		const start = new Date(data.weekStart);
		const end = addDays(start, 6);
		return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
	}, [data?.weekStart]);

	const hasPlan = Boolean(data?.plan);
	const items = data?.items ?? [];

	async function handleCopy() {
		if (items.length === 0) return;
		try {
			await copyToClipboard(buildCopyText(items));
			setCopyStatus("done");
			window.setTimeout(() => setCopyStatus("idle"), 1500);
		} catch {
			setCopyStatus("error");
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

	if (!hasPlan) {
		return (
			<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 text-center">
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
		);
	}

	if (items.length === 0) {
		return (
			<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 text-center">
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
				<Button
					onClick={handleCopy}
					className="bg-primary text-primary-foreground"
				>
					{copyStatus === "done"
						? "Copied"
						: copyStatus === "error"
							? "Copy failed"
							: "Copy list"}
				</Button>
			</CardHeader>
			<CardContent className="space-y-3">
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
			</CardContent>
		</Card>
	);
}
