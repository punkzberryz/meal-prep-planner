"use client";

import { addDays, format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ApiMeal = { id: string; name: string };
type ApiSlot = {
	id: string;
	date: string;
	type: "LUNCH" | "DINNER";
	mealId: string | null;
	meal: ApiMeal | null;
	overriddenAt: string | null;
};
type ApiPlan = {
	id: string;
	weekStart: string;
	generatedAt: string | null;
	slots: ApiSlot[];
};

function toWeekStartParam(weekStartIso: string) {
	const date = new Date(weekStartIso);
	return format(date, "yyyy-MM-dd");
}

function slotLabel(type: ApiSlot["type"]) {
	return type === "LUNCH" ? "Lunch" : "Dinner";
}

export function WeekPlanner() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [weekStart, setWeekStart] = useState<string | null>(null);
	const [plan, setPlan] = useState<ApiPlan | null>(null);
	const [meals, setMeals] = useState<ApiMeal[]>([]);
	const [busySlotId, setBusySlotId] = useState<string | null>(null);
	const [busyGenerate, setBusyGenerate] = useState(false);

	const loadCurrentWeek = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/plans/week", { cache: "no-store" });
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data?.error ?? "Failed to load plan.");
			}
			setWeekStart(data.weekStart);
			setPlan(data.plan);
			setMeals(data.meals ?? []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load plan.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadCurrentWeek();
	}, [loadCurrentWeek]);

	const days = useMemo(() => {
		if (!weekStart) return [];
		const start = new Date(weekStart);
		return Array.from({ length: 7 }, (_, i) => addDays(start, i));
	}, [weekStart]);

	const slotsByKey = useMemo(() => {
		const map = new Map<string, ApiSlot>();
		for (const slot of plan?.slots ?? []) {
			map.set(`${slot.date}:${slot.type}`, slot);
		}
		return map;
	}, [plan]);

	async function handleGenerate(force: boolean) {
		if (!weekStart) return;
		setBusyGenerate(true);
		setError(null);
		try {
			const response = await fetch("/api/plans/week/generate", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					weekStart: toWeekStartParam(weekStart),
					force,
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data?.error ?? "Failed to generate plan.");
			}
			setPlan(data.plan);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to generate plan.");
		} finally {
			setBusyGenerate(false);
		}
	}

	async function handleSlotChange(slotId: string, nextMealId: string) {
		setBusySlotId(slotId);
		setError(null);
		try {
			const response = await fetch(`/api/plans/slots/${slotId}`, {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ mealId: nextMealId === "" ? null : nextMealId }),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data?.error ?? "Failed to update slot.");
			}

			setPlan((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					slots: prev.slots.map((slot) =>
						slot.id === slotId ? { ...slot, ...data.slot } : slot,
					),
				};
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update slot.");
		} finally {
			setBusySlotId(null);
		}
	}

	const titleRange = useMemo(() => {
		if (days.length === 0) return "";
		const start = days[0];
		const end = days[6];
		return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
	}, [days]);

	if (loading) {
		return (
			<Card className="border-emerald-900/10 bg-white/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-emerald-950">
						Weekly plan
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-10 w-56" />
					<Skeleton className="h-48 w-full" />
				</CardContent>
			</Card>
		);
	}

	const hasMeals = meals.length > 0;
	const hasPlan = Boolean(plan);

	return (
		<Card className="border-emerald-900/10 bg-white/80">
			<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
				<div>
					<CardTitle className="font-display text-xl text-emerald-950">
						Weekly plan
					</CardTitle>
					<p className="text-sm text-emerald-900/70">{titleRange}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						disabled={!hasMeals || busyGenerate}
						onClick={() => handleGenerate(false)}
						className="bg-emerald-900 text-white hover:bg-emerald-800"
					>
						{hasPlan ? "Generate again" : "Generate plan"}
					</Button>
					<Button
						variant="outline"
						disabled={!hasPlan || busyGenerate}
						onClick={() => {
							if (!window.confirm("Overwrite any overrides and regenerate?"))
								return;
							handleGenerate(true);
						}}
					>
						Regenerate (force)
					</Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{error ? (
					<div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
						{error}
					</div>
				) : null}

				{!hasMeals ? (
					<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950/80">
						Add a few meals first, then come back to generate a rotation-based
						plan.
					</div>
				) : null}

				<div className="overflow-x-auto">
					<table className="min-w-[48rem] w-full border-separate border-spacing-0">
						<thead>
							<tr>
								<th className="sticky left-0 z-10 w-28 bg-white/80 px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-emerald-900/60">
									Slot
								</th>
								{days.map((day) => (
									<th
										key={day.toISOString()}
										className="px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-emerald-900/60"
									>
										<div>{format(day, "EEE")}</div>
										<div className="text-[11px] tracking-[0.12em]">
											{format(day, "MMM d")}
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{(["LUNCH", "DINNER"] as const).map((type) => (
								<tr key={type}>
									<td className="sticky left-0 z-10 bg-white/80 px-3 py-3 text-sm font-medium text-emerald-950">
										{slotLabel(type)}
									</td>
									{days.map((day) => {
										const key = `${day.toISOString()}:${type}`;
										const slot = slotsByKey.get(key);
										return (
											<td key={key} className="px-3 py-3 align-top">
												{!slot ? (
													<div className="text-xs text-emerald-900/50">
														{hasPlan ? "Missing slot" : "Not generated"}
													</div>
												) : (
													<div className="space-y-1">
														<select
															className="w-full rounded-md border border-emerald-900/15 bg-white px-2 py-2 text-sm text-emerald-950 shadow-sm focus:border-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-900/10"
															value={slot.mealId ?? ""}
															disabled={busySlotId === slot.id}
															onChange={(event) =>
																handleSlotChange(slot.id, event.target.value)
															}
														>
															<option value="">Unassigned</option>
															{meals.map((meal) => (
																<option key={meal.id} value={meal.id}>
																	{meal.name}
																</option>
															))}
														</select>
														{slot.overriddenAt ? (
															<div className="text-[11px] text-emerald-900/50">
																Edited
															</div>
														) : null}
													</div>
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}
