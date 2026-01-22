import { AppPage } from "@/components/app/app-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MealsPage() {
	return (
		<AppPage title="Meals" subtitle="Library">
			<Card className="border-emerald-900/10 bg-white/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-emerald-950">
						Meal library coming soon
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-emerald-900/70">
					Add and manage your recipes here once CRUD is wired.
				</CardContent>
			</Card>
		</AppPage>
	);
}
