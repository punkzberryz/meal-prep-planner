"use client";

import { useState } from "react";
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
import { useChangePassword } from "@/lib/queries/auth";

export function SecurityCard() {
	const changePassword = useChangePassword();
	const [currentPassword, setCurrentPassword] = useState("");
	const [nextPassword, setNextPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [actionError, setActionError] = useState<string | null>(null);
	const busy = changePassword.isPending;
	const trimmedNext = nextPassword.trim();
	const trimmedCurrent = currentPassword.trim();
	const trimmedConfirm = confirmPassword.trim();
	const meetsLength = trimmedNext.length >= 8;
	const hasNumberOrSymbol = /[^A-Za-z\s]/.test(trimmedNext);
	const sameAsCurrent =
		trimmedNext.length > 0 && trimmedNext === trimmedCurrent;
	const mismatch = trimmedConfirm.length > 0 && trimmedNext !== trimmedConfirm;

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setActionError(null);

		if (mismatch) {
			const message = "New password and confirmation do not match.";
			setActionError(message);
			toast.error(message);
			return;
		}

		if (!meetsLength) {
			const message = "New password must be at least 8 characters.";
			setActionError(message);
			toast.error(message);
			return;
		}

		if (sameAsCurrent) {
			const message = "New password must be different from your current one.";
			setActionError(message);
			toast.error(message);
			return;
		}

		try {
			await changePassword.mutateAsync({
				currentPassword,
				nextPassword,
			});
			setCurrentPassword("");
			setNextPassword("");
			setConfirmPassword("");
			toast.success("Password updated.");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to update password.";
			setActionError(message);
			toast.error(message);
		}
	}

	const disableSubmit =
		busy ||
		trimmedCurrent === "" ||
		trimmedNext === "" ||
		trimmedConfirm === "";

	return (
		<Card className="border-border bg-card/80">
			<CardHeader>
				<CardTitle className="font-display text-xl text-foreground">
					Account security
				</CardTitle>
				<CardDescription>
					Update your password to keep your account secure.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="current-password">Current password</Label>
						<Input
							id="current-password"
							type="password"
							autoComplete="current-password"
							value={currentPassword}
							onChange={(event) => setCurrentPassword(event.target.value)}
							disabled={busy}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-password">New password</Label>
						<Input
							id="new-password"
							type="password"
							autoComplete="new-password"
							value={nextPassword}
							onChange={(event) => setNextPassword(event.target.value)}
							disabled={busy}
						/>
						<div className="space-y-1 text-xs text-muted-foreground">
							<p>Use at least 8 characters.</p>
							<p
								className={
									hasNumberOrSymbol
										? "text-foreground"
										: "text-muted-foreground"
								}
							>
								Add a number or symbol for extra strength.
							</p>
						</div>
						{sameAsCurrent ? (
							<p className="text-xs text-destructive">
								New password matches your current one.
							</p>
						) : null}
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">Confirm new password</Label>
						<Input
							id="confirm-password"
							type="password"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							disabled={busy}
						/>
						{mismatch ? (
							<p className="text-xs text-destructive">
								Passwords do not match.
							</p>
						) : null}
					</div>
					{actionError ? (
						<p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{actionError}
						</p>
					) : null}
					<Button
						type="submit"
						className="bg-primary text-primary-foreground hover:bg-primary/90"
						disabled={disableSubmit}
					>
						{busy ? "Updating..." : "Update password"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
