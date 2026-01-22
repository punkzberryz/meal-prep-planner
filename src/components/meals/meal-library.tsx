"use client";

import { InfoIcon } from "lucide-react";
import Image from "next/image";
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
import {
	type MealDetail,
	useCreateMeal,
	useDeleteMeal,
	useMealDetail,
	useMealsList,
	useUpdateMeal,
} from "@/lib/queries/meals";
import { useMealsUiStore } from "@/lib/stores/meals-ui";

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
					className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-white text-muted-foreground hover:bg-accent/40 hover:text-foreground"
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
	const [error, setError] = useState<string | null>(null);
	const { selectedMealId, setSelectedMealId, clearSelection } =
		useMealsUiStore();
	const {
		data: mealsData,
		isLoading: loadingList,
		error: listError,
	} = useMealsList();
	const {
		data: mealDetailData,
		error: detailError,
		isFetching: loadingDetail,
	} = useMealDetail(selectedMealId);
	const createMeal = useCreateMeal();
	const updateMeal = useUpdateMeal();
	const deleteMeal = useDeleteMeal();

	const meals = mealsData?.meals ?? [];
	const selectedMeal = mealDetailData?.meal ?? null;
	const busy =
		createMeal.isPending || updateMeal.isPending || deleteMeal.isPending;
	const combinedError =
		error ??
		(listError instanceof Error ? listError.message : null) ??
		(detailError instanceof Error ? detailError.message : null);

	const [name, setName] = useState("");
	const [notes, setNotes] = useState("");
	const [servings, setServings] = useState<string>("");
	const [ingredientsText, setIngredientsText] = useState("");
	const [tagsText, setTagsText] = useState("");

	const selectedLabel = useMemo(() => {
		if (!selectedMealId) return "New meal";
		return meals.find((m) => m.id === selectedMealId)?.name ?? "Meal";
	}, [meals, selectedMealId]);

	const isEditingExisting = Boolean(selectedMealId);

	const hydrateForm = useCallback((meal: MealDetail | null) => {
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
			hydrateForm(null);
			return;
		}
		if (!selectedMeal) {
			hydrateForm(null);
			return;
		}
		hydrateForm(selectedMeal);
	}, [selectedMealId, selectedMeal, hydrateForm]);

	async function handleSave() {
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

			if (isEditingExisting && selectedMealId) {
				const data = await updateMeal.mutateAsync({
					mealId: selectedMealId,
					payload,
				});
				const createdOrUpdatedId = data.meal?.id as string | undefined;
				if (createdOrUpdatedId) setSelectedMealId(createdOrUpdatedId);
				return;
			}

			const data = await createMeal.mutateAsync(payload);
			const createdOrUpdatedId = data.meal?.id as string | undefined;
			if (createdOrUpdatedId) setSelectedMealId(createdOrUpdatedId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save meal.");
		}
	}

	async function handleDelete() {
		if (!selectedMealId) return;
		if (!window.confirm("Delete this meal?")) return;

		setError(null);
		try {
			await deleteMeal.mutateAsync(selectedMealId);
			clearSelection();
			hydrateForm(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete meal.");
		}
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
			<Card className="border-border bg-card/80">
				<CardHeader className="flex flex-row items-center justify-between gap-3">
					<CardTitle className="font-display text-xl text-foreground">
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
						<div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3">
							<div
								aria-hidden="true"
								className="absolute inset-0 opacity-40"
								style={{
									backgroundImage:
										"url('/assets/illustrations/loading-accent.webp')",
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							/>
							<div className="relative space-y-2">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>
					) : (
						<div className="space-y-2">
							{meals.length === 0 ? (
								<div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-accent/20 p-4 text-center">
									<Image
										src="/assets/illustrations/empty-meals.webp"
										alt="Empty meals illustration"
										width={240}
										height={240}
										className="h-32 w-32"
									/>
									<p className="text-sm text-muted-foreground">
										No meals yet. Create your first one on the right.
									</p>
								</div>
							) : null}
							{meals.map((meal) => (
								<button
									key={meal.id}
									type="button"
									onClick={() => setSelectedMealId(meal.id)}
									className={[
										"w-full rounded-lg border px-3 py-2 text-left transition",
										selectedMealId === meal.id
											? "border-primary/30 bg-accent/40"
											: "border-border bg-white hover:bg-accent/30",
									].join(" ")}
								>
									<div className="flex items-center justify-between gap-3">
										<p className="font-medium text-foreground">{meal.name}</p>
										<span className="text-xs text-muted-foreground">
											{meal.tags.length ? meal.tags.join(", ") : "No tags"}
										</span>
									</div>
								</button>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="border-border bg-card/80">
				<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
					<CardTitle className="font-display text-xl text-foreground">
						{selectedLabel}
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							onClick={handleSave}
							disabled={busy || !name.trim()}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
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
					{combinedError ? (
						<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
							{combinedError}
						</div>
					) : null}
					{loadingDetail ? (
						<div className="rounded-lg border border-border/60 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
							Loading meal details...
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
							className="min-h-20 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
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
							className="min-h-40 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
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
