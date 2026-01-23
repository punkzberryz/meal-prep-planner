import type { ReactNode } from "react";
import { DashboardOverviewLoading } from "@/components/dashboard/dashboard-overview-loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AppPageFallbackLayoutProps = {
	subtitle?: string;
	actions?: ReactNode;
	children: ReactNode;
};

function AppPageFallbackLayout({
	subtitle,
	actions,
	children,
}: AppPageFallbackLayoutProps) {
	return (
		<div className="min-h-svh">
			<header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card/70 px-6 py-4 backdrop-blur">
				<div className="flex items-center gap-3">
					<Skeleton className="h-9 w-9 rounded-lg" />
					<div className="space-y-2">
						{subtitle ? <Skeleton className="h-4 w-28" /> : null}
						<Skeleton className="h-7 w-52" />
					</div>
				</div>
				{actions ? (
					<div className="flex items-center gap-2">{actions}</div>
				) : null}
			</header>
			<main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
		</div>
	);
}

export function DashboardPageFallback() {
	return (
		<AppPageFallbackLayout
			subtitle="Welcome back"
			actions={
				<>
					<Skeleton className="h-9 w-28 rounded-md" />
					<Skeleton className="h-9 w-24 rounded-md" />
					<Skeleton className="h-9 w-28 rounded-md" />
				</>
			}
		>
			<DashboardOverviewLoading />
		</AppPageFallbackLayout>
	);
}

export function PlansPageFallback() {
	return (
		<AppPageFallbackLayout subtitle="Weekly overview">
			<Card className="border-border bg-card/80">
				<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
					<div className="space-y-2">
						<CardTitle className="font-display text-xl text-foreground">
							Weekly plan
						</CardTitle>
						<Skeleton className="h-4 w-36" />
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-9 w-24 rounded-md" />
						<Skeleton className="h-9 w-24 rounded-md" />
						<Skeleton className="h-9 w-32 rounded-md" />
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-56 w-full rounded-xl" />
				</CardContent>
			</Card>
		</AppPageFallbackLayout>
	);
}

export function MealsPageFallback() {
	return (
		<AppPageFallbackLayout subtitle="Library">
			<Card className="border-border bg-card/80">
				<CardHeader className="space-y-2">
					<CardTitle className="font-display text-xl text-foreground">
						Meal library
					</CardTitle>
					<Skeleton className="h-4 w-32" />
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-10 w-full" />
					<div className="grid gap-3 md:grid-cols-2">
						<Skeleton className="h-24 w-full rounded-xl" />
						<Skeleton className="h-24 w-full rounded-xl" />
						<Skeleton className="h-24 w-full rounded-xl" />
						<Skeleton className="h-24 w-full rounded-xl" />
					</div>
				</CardContent>
			</Card>
		</AppPageFallbackLayout>
	);
}

export function GroceryPageFallback() {
	return (
		<AppPageFallbackLayout subtitle="Weekly essentials">
			<Card className="border-border bg-card/80">
				<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
					<div className="space-y-2">
						<CardTitle className="font-display text-xl text-foreground">
							Grocery list
						</CardTitle>
						<Skeleton className="h-4 w-28" />
					</div>
					<Skeleton className="h-9 w-28 rounded-md" />
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-5/6" />
					<Skeleton className="h-8 w-2/3" />
					<Skeleton className="h-8 w-1/2" />
				</CardContent>
			</Card>
		</AppPageFallbackLayout>
	);
}

export function SettingsPageFallback() {
	return (
		<AppPageFallbackLayout subtitle="Account">
			<Card className="border-border bg-card/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-foreground">
						Settings
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-4 w-1/2" />
				</CardContent>
			</Card>
		</AppPageFallbackLayout>
	);
}
