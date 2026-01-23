import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/queries/api";
import { queryKeys } from "@/lib/query-keys";

export type GroceryItem = {
	text: string;
	count: number;
	mealIds: string[];
	mealNames: string[];
};

export type GroceryResponse = {
	weekStart: string;
	plan: {
		id: string;
		generatedAt: string | null;
		slotCount: number;
	} | null;
	items: GroceryItem[];
};

export function useGroceryList(weekStart?: string | null) {
	return useQuery({
		queryKey: queryKeys.grocery.week(weekStart),
		queryFn: () =>
			apiJson<GroceryResponse>(
				weekStart
					? `/api/grocery?weekStart=${encodeURIComponent(weekStart)}`
					: "/api/grocery",
			),
	});
}
