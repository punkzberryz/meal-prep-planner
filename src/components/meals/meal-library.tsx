"use client";

import { InfoIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import {
	type MealDetail,
	useAddMealImage,
	useCreateMeal,
	useDeleteMeal,
	useDeleteMealImage,
	useMealDetail,
	useMealsList,
	useReorderMealImages,
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
	const addMealImage = useAddMealImage();
	const reorderMealImages = useReorderMealImages();
	const deleteMealImage = useDeleteMealImage();

	const meals = mealsData?.meals ?? [];
	const selectedMeal = mealDetailData?.meal ?? null;
	const busy =
		createMeal.isPending ||
		updateMeal.isPending ||
		deleteMeal.isPending ||
		addMealImage.isPending ||
		reorderMealImages.isPending ||
		deleteMealImage.isPending;
	const combinedError =
		error ??
		(listError instanceof Error ? listError.message : null) ??
		(detailError instanceof Error ? detailError.message : null);

	const [name, setName] = useState("");
	const [notes, setNotes] = useState("");
	const [servings, setServings] = useState<string>("");
	const [ingredientsText, setIngredientsText] = useState("");
	const [tagsText, setTagsText] = useState("");
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadQueue, setUploadQueue] = useState<
		Array<{
			id: string;
			name: string;
			progress: number;
			status: "uploading" | "done" | "error";
		}>
	>([]);
	const isMobile = useMediaQuery("(max-width: 640px)");
	const prevSelectedMealIdRef = useRef<string | null>(null);

	const Root = isMobile ? Drawer : Dialog;
	const Trigger = isMobile ? DrawerTrigger : DialogTrigger;
	const Content = isMobile ? DrawerContent : DialogContent;
	const Header = isMobile ? DrawerHeader : DialogHeader;
	const Title = isMobile ? DrawerTitle : DialogTitle;
	const Description = isMobile ? DrawerDescription : DialogDescription;
	const Footer = isMobile ? DrawerFooter : DialogFooter;
	const Close = isMobile ? DrawerClose : DialogClose;

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

	useEffect(() => {
		if (prevSelectedMealIdRef.current === selectedMealId) return;
		prevSelectedMealIdRef.current = selectedMealId;
		setUploadQueue([]);
	}, [selectedMealId]);

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
				toast.success("Meal updated.");
				return;
			}

			const data = await createMeal.mutateAsync(payload);
			const createdOrUpdatedId = data.meal?.id as string | undefined;
			if (createdOrUpdatedId) setSelectedMealId(createdOrUpdatedId);
			toast.success("Meal added.");
		} catch (err) {
			toast.error("Failed to save meal.");
			setError(err instanceof Error ? err.message : "Failed to save meal.");
		}
	}

	async function handleDelete() {
		if (!selectedMealId) return;

		setError(null);
		try {
			await deleteMeal.mutateAsync(selectedMealId);
			clearSelection();
			hydrateForm(null);
			setConfirmOpen(false);
			toast.success("Meal deleted.");
		} catch (err) {
			toast.error("Failed to delete meal.");
			setError(err instanceof Error ? err.message : "Failed to delete meal.");
		}
	}

	function makeUploadId() {
		if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
			return crypto.randomUUID();
		}
		return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	}

	function updateUploadStatus(
		id: string,
		updates: Partial<{
			progress: number;
			status: "uploading" | "done" | "error";
		}>,
	) {
		setUploadQueue((current) =>
			current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
		);
	}

	function uploadFileWithProgress(file: File, title: string, id: string) {
		return new Promise<string>((resolve, reject) => {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("title", title);

			const xhr = new XMLHttpRequest();
			xhr.open("POST", "/api/images/upload");
			xhr.upload.onprogress = (event) => {
				if (!event.lengthComputable) return;
				const percent = Math.round((event.loaded / event.total) * 100);
				updateUploadStatus(id, { progress: percent });
			};
			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText) as { url?: string };
						if (!response.url) {
							reject(new Error("Missing URL in response"));
							return;
						}
						resolve(response.url);
					} catch (error) {
						reject(error);
					}
				} else {
					reject(new Error(xhr.responseText || "Upload failed"));
				}
			};
			xhr.onerror = () => reject(new Error("Upload failed"));
			xhr.send(formData);
		});
	}

	async function handleUploadFiles(files: FileList | File[]) {
		if (uploading) {
			toast.error("An upload is already in progress.");
			return;
		}
		if (!selectedMealId) {
			toast.error("Save the meal first to add images.");
			return;
		}

		if (!name.trim()) {
			toast.error("Add a meal name before uploading images.");
			return;
		}

		const fileArray = Array.from(files);
		if (fileArray.length === 0) return;

		setUploading(true);
		try {
			const queued = fileArray.map((file) => ({
				id: makeUploadId(),
				name: file.name,
				progress: 0,
				status: "uploading" as const,
			}));
			setUploadQueue((current) => [...current, ...queued]);

			const title = name.trim();
			for (const [index, file] of fileArray.entries()) {
				const queueId = queued[index]?.id ?? makeUploadId();

				if (!file.type.startsWith("image/")) {
					toast.error("Only image files are allowed.");
					updateUploadStatus(queueId, { status: "error" });
					continue;
				}

				let url = "";
				try {
					url = await uploadFileWithProgress(file, title, queueId);
					updateUploadStatus(queueId, { progress: 100 });
				} catch (error) {
					console.error(error);
					toast.error("Image upload failed.");
					updateUploadStatus(queueId, { status: "error" });
					continue;
				}

				try {
					await addMealImage.mutateAsync({
						mealId: selectedMealId,
						url,
					});
					updateUploadStatus(queueId, { status: "done", progress: 100 });
				} catch (error) {
					console.error(error);
					toast.error("Failed to attach image to meal.");
					updateUploadStatus(queueId, { status: "error" });
				}
			}
		} catch (err) {
			console.error(err);
			toast.error("Failed to upload images.");
		} finally {
			setUploading(false);
			setUploadQueue((current) =>
				current.filter((item) => item.status === "uploading"),
			);
		}
	}

	async function handleMoveImage(imageId: string, direction: "up" | "down") {
		if (!selectedMealId || !selectedMeal?.images?.length) return;
		const images = [...selectedMeal.images].sort(
			(a, b) => a.position - b.position,
		);
		const index = images.findIndex((image) => image.id === imageId);
		if (index === -1) return;

		const targetIndex = direction === "up" ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= images.length) return;

		const next = [...images];
		const [moved] = next.splice(index, 1);
		next.splice(targetIndex, 0, moved);

		await reorderMealImages.mutateAsync({
			mealId: selectedMealId,
			orderedIds: next.map((image) => image.id),
		});
	}

	async function handleDeleteImage(imageId: string) {
		if (!selectedMealId) return;
		await deleteMealImage.mutateAsync({ mealId: selectedMealId, imageId });
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
						<Root open={confirmOpen} onOpenChange={setConfirmOpen}>
							<Trigger asChild>
								<Button variant="outline" disabled={busy || !selectedMealId}>
									Delete
								</Button>
							</Trigger>
							<Content className="sm:max-w-[420px]">
								<Header>
									<Title>Delete this meal?</Title>
									<Description>
										This removes{" "}
										<span className="font-medium text-foreground">
											{selectedMeal?.name ?? "this meal"}
										</span>{" "}
										from your library. This cannot be undone.
									</Description>
								</Header>
								<Footer className="gap-2 sm:gap-0">
									<Close asChild>
										<Button variant="outline">Cancel</Button>
									</Close>
									<Button
										variant="destructive"
										onClick={handleDelete}
										disabled={busy || !selectedMealId}
									>
										Delete meal
									</Button>
								</Footer>
							</Content>
						</Root>
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
							<Label>Images</Label>
							<FieldHelp text="Upload meal photos. The first image is the primary. You can reorder them." />
						</div>
						<label
							className={[
								"relative block rounded-lg border border-dashed border-border bg-white/70 p-4 transition",
								busy || uploading || !selectedMealId
									? "cursor-not-allowed opacity-60"
									: "cursor-pointer hover:bg-accent/20",
							].join(" ")}
							onDragOver={(event) => {
								event.preventDefault();
							}}
							onDrop={(event) => {
								event.preventDefault();
								if (busy || uploading || !selectedMealId) return;
								if (event.dataTransfer.files) {
									void handleUploadFiles(event.dataTransfer.files);
								}
							}}
						>
							<input
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={(event) => {
									const { files } = event.target;
									if (files) void handleUploadFiles(files);
									event.currentTarget.value = "";
								}}
								disabled={busy || uploading || !selectedMealId}
							/>
							<div className="flex flex-col gap-1 text-left">
								<p className="text-sm font-medium text-foreground">
									Drag & drop images here, or click to select
								</p>
								<p className="text-xs text-muted-foreground">
									Uploads are converted to WebP and resized to 1200×900 max.
								</p>
								{!selectedMealId ? (
									<p className="text-xs text-muted-foreground">
										Save the meal first to upload images.
									</p>
								) : null}
							</div>
							{uploading ? (
								<div className="absolute inset-0 overflow-hidden rounded-lg bg-white/85">
									<div
										aria-hidden="true"
										className="absolute inset-0 opacity-30"
										style={{
											backgroundImage:
												"url('/assets/illustrations/loading-accent.webp')",
											backgroundSize: "cover",
											backgroundPosition: "center",
										}}
									/>
									<div className="relative z-10 flex h-full items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
										Uploading images...
									</div>
								</div>
							) : null}
							{uploadQueue.length > 0 ? (
								<div className="mt-4 space-y-2">
									{uploadQueue.map((item) => (
										<div
											key={item.id}
											className="rounded-md border border-border/60 bg-white px-3 py-2 text-xs text-muted-foreground"
										>
											<div className="flex items-center justify-between gap-2">
												<span className="truncate">{item.name}</span>
												<span className="text-[11px] text-muted-foreground">
													{item.status === "error"
														? "Failed"
														: item.status === "done"
															? "Done"
															: `${item.progress}%`}
												</span>
											</div>
											<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
												<div
													className={[
														"h-full transition-all",
														item.status === "error"
															? "bg-destructive"
															: item.status === "done"
																? "bg-primary"
																: "bg-primary/70",
													].join(" ")}
													style={{ width: `${item.progress}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							) : null}
						</label>
						{selectedMeal?.images?.length ? (
							<div className="space-y-3">
								{[...selectedMeal.images]
									.sort((a, b) => a.position - b.position)
									.map((image, index) => (
										<div
											key={image.id}
											className="flex flex-col gap-3 rounded-lg border border-border/60 bg-white p-3 sm:flex-row sm:items-center"
										>
											<div className="relative h-28 w-full overflow-hidden rounded-md sm:h-20 sm:w-28">
												<Image
													src={image.url}
													alt={selectedMeal?.name ?? "Meal image"}
													fill
													className="object-cover"
												/>
											</div>
											<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
												<div>
													<p className="text-sm font-medium text-foreground">
														Image {index + 1}
													</p>
													<p className="text-xs text-muted-foreground">
														{index === 0 ? "Primary image" : "Secondary image"}
													</p>
												</div>
												<div className="flex flex-wrap gap-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => void handleMoveImage(image.id, "up")}
														disabled={busy || index === 0}
													>
														Move up
													</Button>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() =>
															void handleMoveImage(image.id, "down")
														}
														disabled={
															busy || index === selectedMeal.images.length - 1
														}
													>
														Move down
													</Button>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => void handleDeleteImage(image.id)}
														disabled={busy}
													>
														Remove
													</Button>
												</div>
											</div>
										</div>
									))}
							</div>
						) : (
							<div className="rounded-lg border border-border/60 bg-accent/10 px-4 py-3 text-sm text-muted-foreground">
								No images yet. Upload a photo to add one.
							</div>
						)}
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
