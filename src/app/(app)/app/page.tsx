import { addWeeks, format } from "date-fns";
import Link from "next/link";
import { AppPage } from "@/components/app/app-page";
import { DashboardPageFallback } from "@/components/app/app-page-fallbacks";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWeekStart } from "@/lib/planner/week";

export default function AppDashboardPage() {
	const currentWeekStart = getWeekStart(new Date());
	const previousWeekStart = format(
		addWeeks(currentWeekStart, -1),
		"yyyy-MM-dd",
	);
	const nextWeekStart = format(addWeeks(currentWeekStart, 1), "yyyy-MM-dd");

	return (
		<AppPage
			title="Your weekly prep dashboard"
			subtitle="Welcome back"
			fallback={<DashboardPageFallback />}
			actions={
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
							Plans
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuLabel>Jump to week</DropdownMenuLabel>
						<DropdownMenuItem asChild>
							<Link href={`/app/plans?weekStart=${previousWeekStart}`}>
								Previous week
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/app/plans">This week</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href={`/app/plans?weekStart=${nextWeekStart}`}>
								Next week
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href="/app/plans">Create plan</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			}
		>
			<DashboardOverview />
		</AppPage>
	);
}
