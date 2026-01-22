import { AppPage } from "@/components/app/app-page";
import { WeekPlanner } from "@/components/plans/week-planner";

export default function PlansPage() {
	return (
		<AppPage title="Plans" subtitle="Weekly overview">
			<WeekPlanner />
		</AppPage>
	);
}
