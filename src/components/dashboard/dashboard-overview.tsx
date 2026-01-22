"use client";

import { addDays, format, isWithinInterval, parse } from "date-fns";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DayButton } from "react-day-picker";
import { getDefaultClassNames } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { type PlanSlot, useUpdateSlot, useWeekPlan } from "@/lib/queries/plans";
import { usePlannerUiStore } from "@/lib/stores/planner-ui";
import { cn } from "@/lib/utils";

type MealByDay = {
	LUNCH?: string | null;
	DINNER?: string | null;
};

function getMealColor(name: string) {
	const firstChar = name.charAt(0).toUpperCase();
	if (firstChar >= "A" && firstChar <= "E") return "apricot";
	if (firstChar >= "F" && firstChar <= "J") return "coral";
	if (firstChar >= "K" && firstChar <= "O") return "sunny";
	if (firstChar >= "P" && firstChar <= "T") return "mint";
	return "cream";
}

function toDateKey(date: Date) {
	return format(date, "yyyy-MM-dd");
}

function fromDateKey(value: string) {
	return parse(value, "yyyy-MM-dd", new Date());
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	mealsByDay,
	...props
}: React.ComponentProps<typeof DayButton> & {
	mealsByDay: Map<string, MealByDay>;
}) {
	const defaultClassNames = getDefaultClassNames();
	const ref = useRef<HTMLButtonElement>(null);
	const key = toDateKey(day.date);
	const meals = mealsByDay.get(key);
	const labels = [meals?.LUNCH, meals?.DINNER].filter(
		(label): label is string => Boolean(label),
	);

	useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="icon"
			data-day={day.date.toLocaleDateString()}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			className={cn(
				"data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex h-full w-full min-h-(--cell-size) flex-col items-center justify-start gap-1 overflow-hidden px-1 py-1 text-center text-xs font-normal leading-none group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md",
				defaultClassNames.day,
				className,
			)}
			{...props}
		>
			<span className="text-xs font-medium leading-4">
				{day.date.getDate()}
			</span>
			{labels.length ? (
				<>
					{/* Mobile dots view */}
					<div className="mt-1 flex flex-row gap-0.5 sm:hidden">
						{labels.map((label) => (
							<div
								key={label}
								className={cn(
									"size-1 rounded-full",
									getMealColor(label) === "apricot" && "bg-[#fbceb1]",
									getMealColor(label) === "coral" && "bg-[#ff7f50]",
									getMealColor(label) === "sunny" && "bg-[#fef08a]",
									getMealColor(label) === "mint" && "bg-[#d1fae5]",
									getMealColor(label) === "cream" && "bg-[#fff7ed]",
								)}
							/>
						))}
					</div>
					{/* Desktop badges view */}
					<div className="mt-1.5 hidden w-full flex-col gap-1 text-left sm:flex">
						{labels.map((label) => (
							<Badge
								key={label}
								variant={getMealColor(label)}
								className="inline-flex w-full whitespace-nowrap rounded-sm px-1 py-0 text-[9px] font-normal leading-tight"
							>
								<span className="truncate">{label}</span>
							</Badge>
						))}
					</div>
				</>
			) : null}
		</Button>
	);
}

export function DashboardOverview() {
	const { data, isLoading, error } = useWeekPlan();
	const { selectedDay, setSelectedDay } = usePlannerUiStore();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const [draftLunchId, setDraftLunchId] = useState("");
	const [draftDinnerId, setDraftDinnerId] = useState("");
	const updateSlot = useUpdateSlot();
	const isMobile = useMediaQuery("(max-width: 640px)");

	const weekStartDate = useMemo(() => {
		if (!data?.weekStart) return null;
		return new Date(data.weekStart);
	}, [data?.weekStart]);

	useEffect(() => {
		if (!weekStartDate || selectedDay) return;
		const today = new Date();
		const isInWeek = isWithinInterval(today, {
			start: weekStartDate,
			end: addDays(weekStartDate, 6),
		});
		const nextSelected = isInWeek ? today : weekStartDate;
		setSelectedDay(toDateKey(nextSelected));
	}, [weekStartDate, selectedDay, setSelectedDay]);

	useEffect(() => {
		if (!dialogOpen) {
			setActionError(null);
			setIsSubmitting(false);
		}
	}, [dialogOpen]);

	const mealsByDay = useMemo(() => {
		const map = new Map<string, MealByDay>();
		for (const slot of data?.plan?.slots ?? []) {
			const key = toDateKey(new Date(slot.date));
			const entry = map.get(key) ?? {};
			if (slot.type === "LUNCH") entry.LUNCH = slot.meal?.name ?? null;
			if (slot.type === "DINNER") entry.DINNER = slot.meal?.name ?? null;
			map.set(key, entry);
		}
		return map;
	}, [data?.plan?.slots]);

	const slotsByDayType = useMemo(() => {
		const map = new Map<string, PlanSlot>();
		for (const slot of data?.plan?.slots ?? []) {
			const key = `${toDateKey(new Date(slot.date))}:${slot.type}`;
			map.set(key, slot);
		}
		return map;
	}, [data?.plan?.slots]);

	const selected = selectedDay ? fromDateKey(selectedDay) : undefined;
	const selectedKey = selected ? toDateKey(selected) : null;
	const selectedMeals = selectedKey ? mealsByDay.get(selectedKey) : undefined;
	const meals = data?.meals ?? [];
	const plan = data?.plan ?? null;

	const weekDays = useMemo(() => {
		if (!weekStartDate) return [];
		return Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
	}, [weekStartDate]);

	const hasPlan = Boolean(data?.plan);
	const selectedLunchSlot = selectedKey
		? slotsByDayType.get(`${selectedKey}:LUNCH`)
		: undefined;
	const selectedDinnerSlot = selectedKey
		? slotsByDayType.get(`${selectedKey}:DINNER`)
		: undefined;

	useEffect(() => {
		setDraftLunchId(selectedLunchSlot?.mealId ?? "");
		setDraftDinnerId(selectedDinnerSlot?.mealId ?? "");
	}, [selectedLunchSlot?.mealId, selectedDinnerSlot?.mealId]);

	const hasChanges =
		(draftLunchId ?? "") !== (selectedLunchSlot?.mealId ?? "") ||
		(draftDinnerId ?? "") !== (selectedDinnerSlot?.mealId ?? "");

	async function handleUpdate() {
		if (!plan) return;
		setActionError(null);
		setIsSubmitting(true);
		try {
			if (
				selectedLunchSlot &&
				draftLunchId !== (selectedLunchSlot.mealId ?? "")
			) {
				await updateSlot.mutateAsync({
					slotId: selectedLunchSlot.id,
					mealId: draftLunchId === "" ? null : draftLunchId,
				});
			}
			if (
				selectedDinnerSlot &&
				draftDinnerId !== (selectedDinnerSlot.mealId ?? "")
			) {
				await updateSlot.mutateAsync({
					slotId: selectedDinnerSlot.id,
					mealId: draftDinnerId === "" ? null : draftDinnerId,
				});
			}
		} catch (err) {
			setActionError(
				err instanceof Error ? err.message : "Failed to update meals.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	const Root = isMobile ? Drawer : Dialog;
	const Trigger = isMobile ? DrawerTrigger : DialogTrigger;
	const Content = isMobile ? DrawerContent : DialogContent;
	const Header = isMobile ? DrawerHeader : DialogHeader;
	const Title = isMobile ? DrawerTitle : DialogTitle;
	const Description = isMobile ? DrawerDescription : DialogDescription;
	const Footer = isMobile ? DrawerFooter : DialogFooter;
	const Close = isMobile ? DrawerClose : DialogClose;
	const bodyClass = isMobile ? "space-y-4 px-4 pb-4" : "space-y-4";

	if (isLoading) {
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

	return (
		<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
			<div className="space-y-6">
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
							onSelect={(date) => setSelectedDay(date ? toDateKey(date) : null)}
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

				<Card className="border-border bg-card/80">
					<CardHeader>
						<CardTitle className="font-display text-xl text-foreground">
							Week snapshot
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						{weekDays.slice(0, 3).map((day, index) => {
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
			</div>

			<div className="space-y-6">
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
						{error ? (
							<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
								{error instanceof Error
									? error.message
									: "Failed to load week."}
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
						<Root open={dialogOpen} onOpenChange={setDialogOpen}>
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
											onChange={(event) => setDraftLunchId(event.target.value)}
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
											onChange={(event) => setDraftDinnerId(event.target.value)}
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
										onClick={handleUpdate}
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
					</CardContent>
				</Card>

				<Card className="border-border bg-card/75">
					<CardHeader>
						<CardTitle className="font-display text-lg text-foreground">
							Grocery list preview
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<div className="flex items-center justify-between">
							<span>Produce</span>
							<span>Spinach, lemons, peppers</span>
						</div>
						<div className="flex items-center justify-between">
							<span>Protein</span>
							<span>Chickpeas, tofu</span>
						</div>
						<div className="flex items-center justify-between">
							<span>Pantry</span>
							<span>Tahini, olive oil</span>
						</div>
						<Button variant="outline" className="w-full border-border">
							Copy list
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
