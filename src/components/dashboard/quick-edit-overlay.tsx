"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import type { PlanMeal, PlanSlot, WeekPlan } from "@/lib/queries/plans";

export function QuickEditOverlay({
	actionError,
	dialogOpen,
	draftDinnerId,
	draftLunchId,
	hasChanges,
	isSubmitting,
	meals,
	onDraftDinnerChange,
	onDraftLunchChange,
	onOpenChange,
	onUpdate,
	plan,
	selected,
	selectedDinnerSlot,
	selectedLunchSlot,
}: {
	actionError: string | null;
	dialogOpen: boolean;
	draftDinnerId: string;
	draftLunchId: string;
	hasChanges: boolean;
	isSubmitting: boolean;
	meals: PlanMeal[];
	onDraftDinnerChange: (value: string) => void;
	onDraftLunchChange: (value: string) => void;
	onOpenChange: (open: boolean) => void;
	onUpdate: () => void;
	plan: WeekPlan | null;
	selected: Date | undefined;
	selectedDinnerSlot: PlanSlot | undefined;
	selectedLunchSlot: PlanSlot | undefined;
}) {
	const isMobile = useMediaQuery("(max-width: 640px)");
	const Root = isMobile ? Drawer : Dialog;
	const Trigger = isMobile ? DrawerTrigger : DialogTrigger;
	const Content = isMobile ? DrawerContent : DialogContent;
	const Header = isMobile ? DrawerHeader : DialogHeader;
	const Title = isMobile ? DrawerTitle : DialogTitle;
	const Description = isMobile ? DrawerDescription : DialogDescription;
	const Footer = isMobile ? DrawerFooter : DialogFooter;
	const Close = isMobile ? DrawerClose : DialogClose;
	const bodyClass = isMobile ? "space-y-4 px-4 pb-4" : "space-y-4";

	return (
		<Root open={dialogOpen} onOpenChange={onOpenChange}>
			<Trigger asChild>
				<Button
					variant="outline"
					className="w-full border-border"
					disabled={!selected}
				>
					Quick edit
				</Button>
			</Trigger>
			<Content>
				<Header>
					<Title>Quick edit meals</Title>
					<Description>
						{selected
							? `Update meals for ${format(selected, "EEE, MMM d")}.`
							: "Select a day to edit meals."}
					</Description>
				</Header>
				{actionError ? (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						{actionError}
					</div>
				) : null}
				{!plan ? (
					<div className="rounded-lg border border-accent/40 bg-accent/30 px-4 py-3 text-sm text-foreground/80">
						Generate a weekly plan before editing meals.
					</div>
				) : null}
				{plan && meals.length === 0 ? (
					<div className="rounded-lg border border-accent/40 bg-accent/30 px-4 py-3 text-sm text-foreground/80">
						Add meals to your library to update this day.
					</div>
				) : null}
				<div className={bodyClass}>
					<div className="space-y-2">
						<Label htmlFor="quick-edit-lunch">Lunch</Label>
						<select
							id="quick-edit-lunch"
							className="w-full rounded-md border border-border bg-white px-2 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
							disabled={!plan || !selectedLunchSlot || isSubmitting}
							value={draftLunchId}
							onChange={(event) => onDraftLunchChange(event.target.value)}
						>
							<option value="">Unassigned</option>
							{meals.map((meal) => (
								<option key={meal.id} value={meal.id}>
									{meal.name}
								</option>
							))}
						</select>
						{plan && !selectedLunchSlot ? (
							<p className="text-xs text-muted-foreground">
								No lunch slot generated for this day.
							</p>
						) : null}
					</div>
					<div className="space-y-2">
						<Label htmlFor="quick-edit-dinner">Dinner</Label>
						<select
							id="quick-edit-dinner"
							className="w-full rounded-md border border-border bg-white px-2 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
							disabled={!plan || !selectedDinnerSlot || isSubmitting}
							value={draftDinnerId}
							onChange={(event) => onDraftDinnerChange(event.target.value)}
						>
							<option value="">Unassigned</option>
							{meals.map((meal) => (
								<option key={meal.id} value={meal.id}>
									{meal.name}
								</option>
							))}
						</select>
						{plan && !selectedDinnerSlot ? (
							<p className="text-xs text-muted-foreground">
								No dinner slot generated for this day.
							</p>
						) : null}
					</div>
				</div>
				<Footer>
					<Button asChild variant="ghost">
						<Link href="/app/plans">Open planner</Link>
					</Button>
					<Button
						onClick={onUpdate}
						disabled={!plan || !hasChanges || isSubmitting}
					>
						{isSubmitting ? (
							<span className="inline-flex items-center gap-2">
								<span className="inline-flex size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Updating
							</span>
						) : (
							"Update"
						)}
					</Button>
					<Close asChild>
						<Button variant="outline">Done</Button>
					</Close>
				</Footer>
			</Content>
		</Root>
	);
}
