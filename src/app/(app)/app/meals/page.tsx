import type { Metadata } from "next";
import { AppPage } from "@/components/app/app-page";
import { MealsPageFallback } from "@/components/app/app-page-fallbacks";
import { MealLibrary } from "@/components/meals/meal-library";

export const metadata: Metadata = {
	title: "Meals",
};

export default function MealsPage() {
	return (
		<AppPage title="Meals" subtitle="Library" fallback={<MealsPageFallback />}>
			<MealLibrary />
		</AppPage>
	);
}
