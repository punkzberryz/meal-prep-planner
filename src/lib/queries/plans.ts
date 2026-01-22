import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/queries/api";
import { queryKeys } from "@/lib/query-keys";

export type PlanMeal = { id: string; name: string };

export type PlanSlot = {
	id: string;
	date: string;
	type: "LUNCH" | "DINNER";
	mealId: string | null;
	meal: PlanMeal | null;
	overriddenAt: string | null;
};

export type WeekPlan = {
	id: string;
	weekStart: string;
	generatedAt: string | null;
	slots: PlanSlot[];
};

export type WeekPlanResponse = {
	weekStart: string;
	plan: WeekPlan | null;
	meals: PlanMeal[];
};

type GeneratePlanPayload = {
	weekStart: string;
	force: boolean;
};

export function useWeekPlan() {
	return useQuery({
		queryKey: queryKeys.plans.week(),
		queryFn: () => apiJson<WeekPlanResponse>("/api/plans/week"),
	});
}

export function useGeneratePlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: GeneratePlanPayload) =>
			apiJson<{ plan: WeekPlan }>("/api/plans/week/generate", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.plans.week() });
			void queryClient.invalidateQueries({
				queryKey: queryKeys.grocery.week(),
			});
		},
	});
}

export function useUpdateSlot() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			slotId,
			mealId,
		}: {
			slotId: string;
			mealId: string | null;
		}) =>
			apiJson<{ slot: PlanSlot }>(`/api/plans/slots/${slotId}`, {
				method: "PATCH",
				body: JSON.stringify({ mealId }),
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.plans.week() });
			void queryClient.invalidateQueries({
				queryKey: queryKeys.grocery.week(),
			});
		},
	});
}
