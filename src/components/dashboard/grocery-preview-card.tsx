"use client";

import { addDays, format } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
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

function downloadTextFile(filename: string, text: string) {
	const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

export function GroceryPreviewCard() {
	const { data, isLoading, error } = useGroceryList();
	const [copyStatus, setCopyStatus] = useState<"idle" | "done" | "error">(
		"idle",
	);
	const [dialogOpen, setDialogOpen] = useState(false);
	const isMobile = useMediaQuery("(max-width: 640px)");

	const items = data?.items ?? [];
	const topItems = items.slice(0, 3);
	const hasPlan = Boolean(data?.plan);
	const weekRange = useMemo(() => {
		if (!data?.weekStart) return "";
		const start = new Date(data.weekStart);
		const end = addDays(start, 6);
		return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
	}, [data?.weekStart]);

	const Root = isMobile ? Drawer : Dialog;
	const Trigger = isMobile ? DrawerTrigger : DialogTrigger;
	const Content = isMobile ? DrawerContent : DialogContent;
	const Header = isMobile ? DrawerHeader : DialogHeader;
	const Title = isMobile ? DrawerTitle : DialogTitle;
	const Description = isMobile ? DrawerDescription : DialogDescription;
	const Footer = isMobile ? DrawerFooter : DialogFooter;
	const Close = isMobile ? DrawerClose : DialogClose;
	const contentClass = isMobile
		? "grid h-[85dvh] w-full max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0"
		: "grid max-h-[85vh] w-full max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0";
	const listClass = "min-h-0 px-6 py-4";

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

	function handleExport() {
		if (items.length === 0) return;
		const label = weekRange ? `-${weekRange.replace(/\s+/g, "")}` : "";
		downloadTextFile(`grocery-list${label}.txt`, buildCopyText(items));
	}

	if (isLoading) {
		return (
			<Card className="border-border bg-card/75">
				<CardHeader>
					<CardTitle className="font-display text-lg text-foreground">
						Grocery list preview
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="border-border bg-card/75">
				<CardHeader>
					<CardTitle className="font-display text-lg text-foreground">
						Grocery list preview
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
			<Card className="border-border bg-card/75">
				<CardHeader>
					<CardTitle className="font-display text-lg text-foreground">
						Grocery list preview
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					<p>Generate a plan to build your grocery list.</p>
					<Button asChild variant="outline" className="w-full border-border">
						<Link href="/app/plans">Go to plans</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-border bg-card/75">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="font-display text-lg text-foreground">
						Grocery list preview
					</CardTitle>
					{weekRange ? (
						<p className="text-sm text-muted-foreground">{weekRange}</p>
					) : null}
				</div>
				<Root open={dialogOpen} onOpenChange={setDialogOpen}>
					<Trigger asChild>
						<Button variant="outline" className="border-border">
							View all
						</Button>
					</Trigger>
					<Content className={contentClass}>
						<Header className="flex-none px-6 pb-2 pt-6">
							<Title>Grocery list</Title>
							<Description>
								{weekRange ? `Items for ${weekRange}.` : "Items for this week."}
							</Description>
						</Header>
						<ScrollArea className={listClass}>
							<div className="pb-2">
								{items.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No ingredients yet. Add ingredients to meals to see them
										here.
									</p>
								) : (
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
								)}
							</div>
						</ScrollArea>
						<Footer className="flex-none gap-2 px-6 pb-6 pt-2">
							<Button onClick={handleCopy} disabled={items.length === 0}>
								{copyStatus === "done"
									? "Copied"
									: copyStatus === "error"
										? "Copy failed"
										: "Copy list"}
							</Button>
							<Button
								variant="outline"
								onClick={handleExport}
								disabled={items.length === 0}
							>
								Export .txt
							</Button>
							<Close asChild>
								<Button variant="ghost">Done</Button>
							</Close>
						</Footer>
					</Content>
				</Root>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				{items.length === 0 ? (
					<p>No ingredients yet. Add ingredients to meals to see them here.</p>
				) : (
					<ul className="space-y-2">
						{topItems.map((item) => (
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
				)}
				{items.length > 3 ? (
					<p className="text-xs text-muted-foreground">
						Showing 3 of {items.length} items.
					</p>
				) : null}
				<Button
					onClick={handleCopy}
					disabled={items.length === 0}
					className="w-full"
				>
					{copyStatus === "done"
						? "Copied"
						: copyStatus === "error"
							? "Copy failed"
							: "Copy list"}
				</Button>
			</CardContent>
		</Card>
	);
}
