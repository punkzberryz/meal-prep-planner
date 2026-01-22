import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(246,214,120,0.65),_rgba(255,244,230,0.35)_45%,_rgba(255,244,230,1)_100%)]">
			<div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
				<Image
					src="/assets/illustrations/empty-week.webp"
					alt="Lost week illustration"
					width={320}
					height={320}
					className="h-40 w-40"
				/>
				<div className="space-y-2">
					<p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
						404
					</p>
					<h1 className="font-display text-3xl text-foreground sm:text-4xl">
						Page not found
					</h1>
					<p className="text-base text-muted-foreground">
						We couldn't find that page. Try heading back home or into the app.
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-3">
					<Button asChild className="bg-primary text-primary-foreground">
						<Link href="/">Back to home</Link>
					</Button>
					<Button asChild variant="outline" className="border-border">
						<Link href="/app">Open app</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
