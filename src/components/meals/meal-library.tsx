"use client";

import { InfoIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type ApiMealListItem = {
	id: string;
	name: string;
	notes: string | null;
	servings: number | null;
	lastPlannedAt: string | null;
	createdAt: string;
	updatedAt: string;
	tags: string[];
};

type ApiIngredient = {
	id: string;
	position: number;
	text: string;
	name: string | null;
	qty: string | null;
	unit: string | null;
};

type ApiMealDetail = ApiMealListItem & {
	ingredients: ApiIngredient[];
};

function parseLines(value: string) {
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function parseTags(value: string) {
	return value
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean);
}

function FieldHelp({ text }: { text: string }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label="Field info"
					className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-emerald-900/10 bg-white text-emerald-900/60 hover:bg-emerald-50 hover:text-emerald-900/80"
				>
					<InfoIcon className="h-4 w-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" sideOffset={8} className="max-w-xs">
				{text}
			</TooltipContent>
		</Tooltip>
	);
}

export function MealLibrary() {
	const [loadingList, setLoadingList] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [meals, setMeals] = useState<ApiMealListItem[]>([]);
	const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
	const [selectedMeal, setSelectedMeal] = useState<ApiMealDetail | null>(null);
	const [busy, setBusy] = useState(false);

	const [name, setName] = useState("");
	const [notes, setNotes] = useState("");
	const [servings, setServings] = useState<string>("");
	const [ingredientsText, setIngredientsText] = useState("");
	const [tagsText, setTagsText] = useState("");

	const loadMeals = useCallback(async () => {
		setLoadingList(true);
		setError(null);
		try {
			const response = await fetch("/api/meals", { cache: "no-store" });
			const data = await response.json();
			if (!response.ok) throw new Error(data?.error ?? "Failed to load meals.");
			setMeals(data.meals ?? []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load meals.");
		} finally {
			setLoadingList(false);
		}
	}, []);

	useEffect(() => {
		loadMeals();
	}, [loadMeals]);

	const selectedLabel = useMemo(() => {
		if (!selectedMealId) return "New meal";
		return meals.find((m) => m.id === selectedMealId)?.name ?? "Meal";
	}, [meals, selectedMealId]);

	const isEditingExisting = Boolean(selectedMealId);

	const loadMealDetail = useCallback(async (mealId: string) => {
		setError(null);
		setSelectedMeal(null);
		try {
			const response = await fetch(`/api/meals/${mealId}`, {
				cache: "no-store",
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data?.error ?? "Failed to load meal.");
			setSelectedMeal(data.meal);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load meal.");
		}
	}, []);

	const hydrateForm = useCallback((meal: ApiMealDetail | null) => {
		if (!meal) {
			setName("");
			setNotes("");
			setServings("");
			setIngredientsText("");
			setTagsText("");
			return;
		}
		setName(meal.name);
		setNotes(meal.notes ?? "");
		setServings(meal.servings?.toString() ?? "");
		setIngredientsText(
			(meal.ingredients ?? [])
				.sort((a, b) => a.position - b.position)
				.map((i) => i.text)
				.join("\n"),
		);
		setTagsText((meal.tags ?? []).join(", "));
	}, []);

	useEffect(() => {
		if (!selectedMealId) {
			setSelectedMeal(null);
			hydrateForm(null);
			return;
		}
		void loadMealDetail(selectedMealId);
	}, [hydrateForm, loadMealDetail, selectedMealId]);

	useEffect(() => {
		if (selectedMeal) hydrateForm(selectedMeal);
	}, [hydrateForm, selectedMeal]);

	async function handleSave() {
		setBusy(true);
		setError(null);
		try {
			const ingredients = parseLines(ingredientsText).map((text) => ({ text }));
			const tags = parseTags(tagsText);

			const payload = {
				name: name.trim(),
				notes: notes.trim() ? notes.trim() : null,
				servings: servings.trim() ? Number.parseInt(servings.trim(), 10) : null,
				ingredients,
				tags,
			};

			const response = await fetch(
				isEditingExisting ? `/api/meals/${selectedMealId}` : "/api/meals",
				{
					method: isEditingExisting ? "PATCH" : "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const data = await response.json();
			if (!response.ok) throw new Error(data?.error ?? "Failed to save meal.");

			await loadMeals();
			const createdOrUpdatedId = data.meal?.id as string | undefined;
			if (createdOrUpdatedId) setSelectedMealId(createdOrUpdatedId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save meal.");
		} finally {
			setBusy(false);
		}
	}

	async function handleDelete() {
		if (!selectedMealId) return;
		if (!window.confirm("Delete this meal?")) return;

		setBusy(true);
		setError(null);
		try {
			const response = await fetch(`/api/meals/${selectedMealId}`, {
				method: "DELETE",
			});
			const data = await response.json();
			if (!response.ok)
				throw new Error(data?.error ?? "Failed to delete meal.");

			setSelectedMealId(null);
			setSelectedMeal(null);
			hydrateForm(null);
			await loadMeals();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete meal.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
			<Card className="border-emerald-900/10 bg-white/80">
				<CardHeader className="flex flex-row items-center justify-between gap-3">
					<CardTitle className="font-display text-xl text-emerald-950">
						Your meals
					</CardTitle>
					<Button
						variant="outline"
						onClick={() => setSelectedMealId(null)}
						disabled={busy}
					>
						New
					</Button>
				</CardHeader>
				<CardContent className="space-y-3">
					{loadingList ? (
						<div className="space-y-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : (
						<div className="space-y-2">
							{meals.length === 0 ? (
								<p className="text-sm text-emerald-900/70">
									No meals yet. Create your first one on the right.
								</p>
							) : null}
							{meals.map((meal) => (
								<button
									key={meal.id}
									type="button"
									onClick={() => setSelectedMealId(meal.id)}
									className={[
										"w-full rounded-lg border px-3 py-2 text-left transition",
										selectedMealId === meal.id
											? "border-emerald-900/25 bg-emerald-50"
											: "border-emerald-900/10 bg-white hover:bg-emerald-50/50",
									].join(" ")}
								>
									<div className="flex items-center justify-between gap-3">
										<p className="font-medium text-emerald-950">{meal.name}</p>
										<span className="text-xs text-emerald-900/50">
											{meal.tags.length ? meal.tags.join(", ") : "No tags"}
										</span>
									</div>
								</button>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="border-emerald-900/10 bg-white/80">
				<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
					<CardTitle className="font-display text-xl text-emerald-950">
						{selectedLabel}
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							onClick={handleSave}
							disabled={busy || !name.trim()}
							className="bg-emerald-900 text-white hover:bg-emerald-800"
						>
							Save
						</Button>
						<Button
							variant="outline"
							onClick={handleDelete}
							disabled={busy || !selectedMealId}
						>
							Delete
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-5">
					{error ? (
						<div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
							{error}
						</div>
					) : null}

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="meal-name">Name</Label>
							<FieldHelp text="The meal name shown in your library and weekly planner." />
						</div>
						<Input
							id="meal-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="e.g. Lemon tahini bowls"
							disabled={busy}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="meal-notes">Notes</Label>
							<FieldHelp text="Optional context like prep tips, substitutions, or a link to the recipe." />
						</div>
						<textarea
							id="meal-notes"
							className="min-h-20 w-full rounded-md border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 shadow-sm focus:border-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-900/10 disabled:opacity-50"
							value={notes}
							onChange={(event) => setNotes(event.target.value)}
							placeholder="Optional notes..."
							disabled={busy}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="meal-servings">Servings</Label>
							<FieldHelp text="Optional. Helps you remember yield, and can be used later for scaling." />
						</div>
						<Input
							id="meal-servings"
							type="number"
							min={1}
							value={servings}
							onChange={(event) => setServings(event.target.value)}
							placeholder="Optional"
							disabled={busy}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="meal-ingredients">
								Ingredients (one per line)
							</Label>
							<FieldHelp text="Write ingredients as free-text lines. Example: '1 can chickpeas' or '2 lemons'. We'll use these lines for grocery list aggregation later." />
						</div>
						<textarea
							id="meal-ingredients"
							className="min-h-40 w-full rounded-md border border-emerald-900/15 bg-white px-3 py-2 font-mono text-sm text-emerald-950 shadow-sm focus:border-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-900/10 disabled:opacity-50"
							value={ingredientsText}
							onChange={(event) => setIngredientsText(event.target.value)}
							placeholder={"1 can chickpeas\n2 lemons\n1 cup quinoa"}
							disabled={busy}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="meal-tags">Tags (comma-separated)</Label>
							<FieldHelp text="Free-form labels like 'vegetarian', 'quick', or 'weeknight'. Tags are case-insensitive and de-duplicated." />
						</div>
						<Input
							id="meal-tags"
							value={tagsText}
							onChange={(event) => setTagsText(event.target.value)}
							placeholder="e.g. vegetarian, quick, weeknight"
							disabled={busy}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
