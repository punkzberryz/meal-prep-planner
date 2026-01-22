import { AppPage } from "@/components/app/app-page";
import { GroceryList } from "@/components/grocery/grocery-list";

export default function GroceryPage() {
	return (
		<AppPage title="Grocery list" subtitle="Weekly essentials">
			<GroceryList />
		</AppPage>
	);
}
