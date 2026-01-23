"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthMe, useUpdateProfile } from "@/lib/queries/auth";

function formatDate(value?: string | null) {
	if (!value) return "";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";
	return format(parsed, "MMM d, yyyy");
}

function formatDateTime(value?: string | null) {
	if (!value) return "";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";
	return format(parsed, "MMM d, yyyy 'at' h:mm a");
}

export function ProfileBasicsCard() {
	const { data, isLoading, error } = useAuthMe();
	const updateProfile = useUpdateProfile();
	const user = data?.user ?? null;
	const [name, setName] = useState("");
	const [initialName, setInitialName] = useState("");
	const [actionError, setActionError] = useState<string | null>(null);

	useEffect(() => {
		const nextName = user?.name ?? "";
		setName(nextName);
		setInitialName(nextName);
	}, [user?.name]);

	const createdLabel = useMemo(
		() => formatDate(user?.createdAt),
		[user?.createdAt],
	);
	const updatedLabel = useMemo(
		() => formatDateTime(user?.updatedAt),
		[user?.updatedAt],
	);

	const trimmedName = name.trim();
	const normalizedInitial = initialName.trim();
	const isDirty = trimmedName !== normalizedInitial;
	const busy = updateProfile.isPending;

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!user) return;
		setActionError(null);

		try {
			await updateProfile.mutateAsync({
				name: trimmedName === "" ? null : trimmedName,
			});
			toast.success("Profile updated.");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to update profile.";
			setActionError(message);
			toast.error(message);
		}
	}

	return (
		<Card className="border-border bg-card/80">
			<CardHeader>
				<CardTitle className="font-display text-xl text-foreground">
					Profile basics
				</CardTitle>
				<CardDescription>
					Keep your name and account details up to date.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				{isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : error ? (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						{error instanceof Error ? error.message : "Failed to load."}
					</div>
				) : user ? (
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="settings-name">Name</Label>
							<Input
								id="settings-name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="Your name"
								disabled={busy}
							/>
							<p className="text-xs text-muted-foreground">
								This name appears across the app and in your account menu.
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="settings-email">Email</Label>
							<Input id="settings-email" value={user.email} disabled />
							<p className="text-xs text-muted-foreground">
								Email changes are not supported yet.
							</p>
						</div>
						<div className="grid gap-3 rounded-xl border border-border/60 bg-accent/20 p-4 text-sm text-muted-foreground sm:grid-cols-2">
							<div>
								<p className="text-xs uppercase tracking-[0.2em]">
									Member since
								</p>
								<p className="mt-2 text-sm text-foreground">
									{createdLabel || "-"}
								</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.2em]">
									Last updated
								</p>
								<p className="mt-2 text-sm text-foreground">
									{updatedLabel || "-"}
								</p>
							</div>
						</div>
						{actionError ? (
							<p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{actionError}
							</p>
						) : null}
						<Button
							type="submit"
							className="bg-primary text-primary-foreground hover:bg-primary/90"
							disabled={!isDirty || busy}
						>
							{busy ? "Saving..." : "Save changes"}
						</Button>
					</form>
				) : (
					<div className="text-sm text-muted-foreground">
						No profile data available.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
