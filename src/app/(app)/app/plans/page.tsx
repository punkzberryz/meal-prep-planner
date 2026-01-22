import { AppPage } from "@/components/app/app-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlansPage() {
	return (
		<AppPage title="Plans" subtitle="Weekly overview">
			<Card className="border-emerald-900/10 bg-white/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-emerald-950">
						Planner view coming soon
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-emerald-900/70">
					This is where weekly plans and overrides will live.
				</CardContent>
			</Card>
		</AppPage>
	);
}
