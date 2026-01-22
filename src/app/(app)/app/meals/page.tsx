import { AppPage } from "@/components/app/app-page";
import { MealLibrary } from "@/components/meals/meal-library";

export default function MealsPage() {
	return (
		<AppPage title="Meals" subtitle="Library">
			<MealLibrary />
		</AppPage>
	);
}
