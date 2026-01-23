import Link from "next/link";
import { AppPage } from "@/components/app/app-page";
import { DashboardPageFallback } from "@/components/app/app-page-fallbacks";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { Button } from "@/components/ui/button";

export default function AppDashboardPage() {
	return (
		<AppPage
			title="Your weekly prep dashboard"
			subtitle="Welcome back"
			fallback={<DashboardPageFallback />}
			actions={
				<div className="flex items-center gap-2">
					<Button asChild variant="outline" className="border-border">
						<Link href="/app/plans">Previous week</Link>
					</Button>
					<Button asChild variant="outline" className="border-border">
						<Link href="/app/plans">Next week</Link>
					</Button>
					<Button
						asChild
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<Link href="/app/plans">Create plan</Link>
					</Button>
				</div>
			}
		>
			<DashboardOverview />
		</AppPage>
	);
}
