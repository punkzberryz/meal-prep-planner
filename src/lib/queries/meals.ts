import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/queries/api";
import { queryKeys } from "@/lib/query-keys";

export type MealListItem = {
	id: string;
	name: string;
	notes: string | null;
	servings: number | null;
	lastPlannedAt: string | null;
	createdAt: string;
	updatedAt: string;
	tags: string[];
};

export type MealIngredient = {
	id: string;
	position: number;
	text: string;
	name: string | null;
	qty: string | null;
	unit: string | null;
};

export type MealDetail = MealListItem & {
	ingredients: MealIngredient[];
};

export type MealPayload = {
	name: string;
	notes: string | null;
	servings: number | null;
	ingredients: Array<{ text: string }>;
	tags: string[];
};

type MealsListResponse = {
	meals: MealListItem[];
};

type MealDetailResponse = {
	meal: MealDetail;
};

export function useMealsList() {
	return useQuery({
		queryKey: queryKeys.meals.list,
		queryFn: () => apiJson<MealsListResponse>("/api/meals"),
	});
}

export function useMealDetail(mealId: string | null) {
	return useQuery({
		queryKey: mealId ? queryKeys.meals.detail(mealId) : ["meals", "detail"],
		queryFn: () => apiJson<MealDetailResponse>(`/api/meals/${mealId}`),
		enabled: Boolean(mealId),
	});
}

export function useCreateMeal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: MealPayload) =>
			apiJson<MealDetailResponse>("/api/meals", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.meals.list });
		},
	});
}

export function useUpdateMeal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			mealId,
			payload,
		}: {
			mealId: string;
			payload: MealPayload;
		}) =>
			apiJson<MealDetailResponse>(`/api/meals/${mealId}`, {
				method: "PATCH",
				body: JSON.stringify(payload),
			}),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.meals.list });
			void queryClient.invalidateQueries({
				queryKey: queryKeys.meals.detail(variables.mealId),
			});
		},
	});
}

export function useDeleteMeal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (mealId: string) =>
			apiJson(`/api/meals/${mealId}`, {
				method: "DELETE",
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.meals.list });
		},
	});
}
