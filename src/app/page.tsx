import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-[#fbf7f0]">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl animate-float-slow" />
				<div className="absolute bottom-20 right-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl animate-float-slow" />
				<div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-rose-200/50 blur-3xl" />
			</div>

			<header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-white">
						MP
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-emerald-900">
							Meal Prep
						</p>
						<p className="font-display text-lg text-emerald-950">Planner</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Button asChild variant="outline" className="border-emerald-900/40">
						<Link href="/login">Sign in</Link>
					</Button>
					<Button
						asChild
						className="bg-emerald-900 text-white hover:bg-emerald-800"
					>
						<Link href="/register">Get started</Link>
					</Button>
				</div>
			</header>

			<main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-8">
				<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
					<div className="space-y-6">
						<p className="text-sm font-medium uppercase tracking-[0.35em] text-emerald-700">
							Weekly rhythm, daily calm
						</p>
						<h1 className="font-display text-4xl leading-tight text-emerald-950 sm:text-5xl">
							Plan meals once. Cook with confidence every day.
						</h1>
						<p className="text-lg leading-relaxed text-emerald-900/80">
							Meal Prep Planner combines community recipes with your favorites,
							then maps each day with a grocery list and step-by-step cooking
							flow.
						</p>
						<div className="flex flex-wrap gap-4">
							<Button
								asChild
								className="bg-emerald-900 text-white hover:bg-emerald-800"
							>
								<Link href="/register">Create your plan</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="border-emerald-900/40"
							>
								<Link href="/login">I already have an account</Link>
							</Button>
						</div>
						<div className="flex flex-wrap gap-6 pt-4 text-sm text-emerald-900/70">
							<span>Default starter meals included</span>
							<span>Personal recipes welcome</span>
							<span>Grocery lists in seconds</span>
						</div>
					</div>

					<div className="space-y-5">
						<Card className="border-emerald-900/10 bg-white/80 shadow-lg backdrop-blur">
							<CardHeader>
								<CardTitle className="font-display text-2xl text-emerald-950">
									This week at a glance
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4 text-sm text-emerald-900/80">
								<div className="flex items-center justify-between">
									<span>Mon</span>
									<span className="font-medium">Miso salmon bowls</span>
									<span className="text-emerald-700">25 min</span>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<span>Tue</span>
									<span className="font-medium">Herb chicken & grains</span>
									<span className="text-emerald-700">35 min</span>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<span>Wed</span>
									<span className="font-medium">Veggie chili stacks</span>
									<span className="text-emerald-700">40 min</span>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<span>Thu</span>
									<span className="font-medium">Lemon pasta + greens</span>
									<span className="text-emerald-700">20 min</span>
								</div>
							</CardContent>
						</Card>

						<Card className="border-amber-200/60 bg-white/90 shadow-lg backdrop-blur">
							<CardHeader>
								<CardTitle className="font-display text-xl text-amber-900">
									Grocery list snapshot
								</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-3 text-sm text-amber-950/80">
								<div className="flex items-center justify-between">
									<span>Produce</span>
									<span>Spinach, lemons, peppers</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Protein</span>
									<span>Salmon, chicken, beans</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Pantry</span>
									<span>Brown rice, miso, olive oil</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				<section className="mt-20 grid gap-6 md:grid-cols-3">
					{[
						{
							title: "Community recipes",
							body: "Users share meals, so your suggestions stay fresh and varied.",
						},
						{
							title: "Plan by preferences",
							body: "Tag meals by cuisine, diet, or cooking time for fast filters later.",
						},
						{
							title: "Cook mode",
							body: "Step-by-step instructions keep the kitchen flow focused.",
						},
					].map((item) => (
						<Card
							key={item.title}
							className="border-emerald-900/10 bg-white/70"
						>
							<CardHeader>
								<CardTitle className="font-display text-xl text-emerald-950">
									{item.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-emerald-900/70">
								{item.body}
							</CardContent>
						</Card>
					))}
				</section>
			</main>

			<footer className="relative z-10 border-t border-emerald-900/10 bg-white/70">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-emerald-900/70 md:flex-row md:items-center md:justify-between">
					<span>Meal Prep Planner • Built for calm kitchens.</span>
					<span>Auth + planning features in progress.</span>
				</div>
			</footer>
		</div>
	);
}
