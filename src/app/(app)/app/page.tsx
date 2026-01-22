import Link from "next/link";
import { AppPage } from "@/components/app/app-page";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppDashboardPage() {
	return (
		<AppPage
			title="Your weekly prep dashboard"
			subtitle="Welcome back"
			actions={
				<Button
					asChild
					className="bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<Link href="/app/plans">Create plan</Link>
				</Button>
			}
		>
			<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
				<Card className="border-border bg-card/80">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="font-display text-xl text-foreground">
								Meal calendar
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								Pick a day to review or adjust your plan.
							</p>
						</div>
						<span className="rounded-full bg-accent/70 px-3 py-1 text-xs text-foreground">
							Draft week
						</span>
					</CardHeader>
					<CardContent>
						<Calendar mode="single" />
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card className="border-accent/40 bg-card/85">
						<CardHeader>
							<CardTitle className="font-display text-lg text-foreground">
								Today’s plan
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm text-foreground/80">
							<div className="flex items-center justify-between">
								<span>Lunch</span>
								<span className="font-medium">Lemon tahini bowls</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Dinner</span>
								<span className="font-medium">Roasted veggie pasta</span>
							</div>
							<Button variant="outline" className="w-full border-border">
								View cooking steps
							</Button>
						</CardContent>
					</Card>

					<Card className="border-border bg-card/75">
						<CardHeader>
							<CardTitle className="font-display text-lg text-foreground">
								Grocery list preview
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm text-muted-foreground">
							<div className="flex items-center justify-between">
								<span>Produce</span>
								<span>Spinach, lemons, peppers</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Protein</span>
								<span>Chickpeas, tofu</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Pantry</span>
								<span>Tahini, olive oil</span>
							</div>
							<Button variant="outline" className="w-full border-border">
								Export list
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppPage>
	);
}
