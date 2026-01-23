import { AppPage } from "@/components/app/app-page";
import { PlansPageFallback } from "@/components/app/app-page-fallbacks";
import { WeekPlanner } from "@/components/plans/week-planner";

export default function PlansPage() {
	return (
		<AppPage
			title="Plans"
			subtitle="Weekly overview"
			fallback={<PlansPageFallback />}
		>
			<WeekPlanner />
		</AppPage>
	);
}
