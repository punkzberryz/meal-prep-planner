import { AppPage } from "@/components/app/app-page";
import { PlansPageFallback } from "@/components/app/app-page-fallbacks";
import { WeekPlanner } from "@/components/plans/week-planner";

type PlansPageProps = {
	searchParams?: { weekStart?: string } | Promise<{ weekStart?: string }>;
};

export default async function PlansPage({ searchParams }: PlansPageProps) {
	const resolvedSearchParams = await searchParams;

	return (
		<AppPage
			title="Plans"
			subtitle="Weekly overview"
			fallback={<PlansPageFallback />}
		>
			<WeekPlanner initialWeekStart={resolvedSearchParams?.weekStart} />
		</AppPage>
	);
}
