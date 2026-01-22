"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(246,214,120,0.65),_rgba(255,244,230,0.35)_45%,_rgba(255,244,230,1)_100%)] text-foreground">
				<div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
					<div className="space-y-2">
						<p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
							Something went wrong
						</p>
						<h1 className="font-display text-3xl text-foreground sm:text-4xl">
							We hit a snag
						</h1>
						<p className="text-base text-muted-foreground">
							Try again, or head back to reset the flow.
						</p>
						{error?.message ? (
							<p className="text-sm text-muted-foreground">{error.message}</p>
						) : null}
					</div>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Button
							onClick={reset}
							className="bg-primary text-primary-foreground"
						>
							Try again
						</Button>
						<Button asChild variant="outline" className="border-border">
							<Link href="/">Back to home</Link>
						</Button>
					</div>
				</div>
			</body>
		</html>
	);
}
