import type { Metadata } from "next";
import { AppPage } from "@/components/app/app-page";
import { GroceryPageFallback } from "@/components/app/app-page-fallbacks";
import { GroceryWeekView } from "@/components/grocery/grocery-week-view";

export const metadata: Metadata = {
	title: "Grocery list",
};

type GroceryPageProps = {
	searchParams?: { weekStart?: string } | Promise<{ weekStart?: string }>;
};

export default async function GroceryPage({ searchParams }: GroceryPageProps) {
	const resolvedSearchParams = await searchParams;

	return (
		<AppPage
			title="Grocery list"
			subtitle="Weekly essentials"
			fallback={<GroceryPageFallback />}
		>
			<GroceryWeekView initialWeekStart={resolvedSearchParams?.weekStart} />
		</AppPage>
	);
}
