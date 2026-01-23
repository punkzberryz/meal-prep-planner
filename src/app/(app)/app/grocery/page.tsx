import type { Metadata } from "next";
import { AppPage } from "@/components/app/app-page";
import { GroceryPageFallback } from "@/components/app/app-page-fallbacks";
import { GroceryList } from "@/components/grocery/grocery-list";

export const metadata: Metadata = {
	title: "Grocery list",
};

export default function GroceryPage() {
	return (
		<AppPage
			title="Grocery list"
			subtitle="Weekly essentials"
			fallback={<GroceryPageFallback />}
		>
			<GroceryList />
		</AppPage>
	);
}
