"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useRegister } from "@/lib/queries/auth";

export function RegisterForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const register = useRegister();

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		const formData = new FormData(event.currentTarget);
		const nameValue = String(formData.get("name") ?? "").trim();
		const payload = {
			email: String(formData.get("email") ?? ""),
			password: String(formData.get("password") ?? ""),
			...(nameValue ? { name: nameValue } : {}),
		};

		try {
			await register.mutateAsync(payload);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Registration failed.";
			setError(message);
			toast.error(message);
			return;
		}

		toast.success("Account created.");
		router.push("/app");
	}

	return (
		<Card className="w-full max-w-md border-border bg-card/80 shadow-xl backdrop-blur">
			<CardHeader className="space-y-2">
				<CardTitle className="text-2xl">Create your account</CardTitle>
				<CardDescription>
					Save meals, build weekly plans, and generate lists.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={onSubmit}>
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input id="name" name="name" autoComplete="name" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							name="email"
							required
							autoComplete="email"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							name="password"
							required
							autoComplete="new-password"
						/>
					</div>
					{error ? (
						<p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					) : null}
					<Button
						type="submit"
						className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
						disabled={register.isPending}
					>
						{register.isPending ? "Creating..." : "Create account"}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link href="/login" className="text-foreground underline">
							Sign in
						</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
