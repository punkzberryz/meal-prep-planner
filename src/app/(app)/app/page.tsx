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
				<Button className="bg-emerald-900 text-white hover:bg-emerald-800">
					Create plan
				</Button>
			}
		>
			<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
				<Card className="border-emerald-900/10 bg-white/80">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="font-display text-xl text-emerald-950">
								Meal calendar
							</CardTitle>
							<p className="text-sm text-emerald-900/70">
								Pick a day to review or adjust your plan.
							</p>
						</div>
						<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-900">
							Draft week
						</span>
					</CardHeader>
					<CardContent>
						<Calendar mode="single" />
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card className="border-amber-200/60 bg-white/85">
						<CardHeader>
							<CardTitle className="font-display text-lg text-amber-900">
								Today’s plan
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm text-amber-950/80">
							<div className="flex items-center justify-between">
								<span>Lunch</span>
								<span className="font-medium">Lemon tahini bowls</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Dinner</span>
								<span className="font-medium">Roasted veggie pasta</span>
							</div>
							<Button variant="outline" className="w-full border-amber-300">
								View cooking steps
							</Button>
						</CardContent>
					</Card>

					<Card className="border-emerald-900/10 bg-white/75">
						<CardHeader>
							<CardTitle className="font-display text-lg text-emerald-950">
								Grocery list preview
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm text-emerald-900/70">
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
							<Button variant="outline" className="w-full border-emerald-300">
								Export list
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppPage>
	);
}
