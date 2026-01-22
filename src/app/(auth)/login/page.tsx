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

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading(true);

		const formData = new FormData(event.currentTarget);
		const payload = {
			email: String(formData.get("email") ?? ""),
			password: String(formData.get("password") ?? ""),
		};

		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		setLoading(false);
		if (!response.ok) {
			const data = await response.json().catch(() => null);
			const message = data?.error ?? "Login failed.";
			setError(message);
			toast.error(message);
			return;
		}

		toast.success("Welcome back.");
		router.push("/app");
	}

	return (
		<Card className="w-full max-w-md border-amber-200/60 bg-white/80 shadow-xl backdrop-blur">
			<CardHeader className="space-y-2">
				<CardTitle className="text-2xl">Welcome back</CardTitle>
				<CardDescription>
					Sign in to manage your meal prep plans.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={onSubmit}>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
						/>
					</div>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					<Button className="w-full" disabled={loading} type="submit">
						{loading ? "Signing in..." : "Sign in"}
					</Button>
				</form>
				<p className="mt-6 text-sm text-muted-foreground">
					New here?{" "}
					<Link
						className="font-medium text-amber-900 underline underline-offset-4"
						href="/register"
					>
						Create an account
					</Link>
				</p>
				<p className="mt-2 text-xs text-muted-foreground">
					<Link className="underline underline-offset-4" href="/">
						Back to landing page
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
