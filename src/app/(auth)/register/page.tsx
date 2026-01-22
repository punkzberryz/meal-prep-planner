"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function RegisterPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading(true);

		const formData = new FormData(event.currentTarget);
		const nameValue = String(formData.get("name") ?? "").trim();
		const payload = {
			email: String(formData.get("email") ?? ""),
			password: String(formData.get("password") ?? ""),
			...(nameValue ? { name: nameValue } : {}),
		};

		const response = await fetch("/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		setLoading(false);
		if (!response.ok) {
			const data = await response.json().catch(() => null);
			setError(data?.error ?? "Registration failed.");
			return;
		}

    router.push("/app");
	}

	return (
		<Card className="w-full max-w-md border-emerald-200/60 bg-white/80 shadow-xl backdrop-blur">
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
						<Input id="name" name="name" type="text" autoComplete="name" />
					</div>
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
							autoComplete="new-password"
							required
						/>
						<p className="text-xs text-muted-foreground">
							Use at least 8 characters.
						</p>
					</div>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					<Button className="w-full" disabled={loading} type="submit">
						{loading ? "Creating account..." : "Create account"}
					</Button>
				</form>
				<p className="mt-6 text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						className="font-medium text-emerald-900 underline underline-offset-4"
						href="/login"
					>
						Sign in
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
