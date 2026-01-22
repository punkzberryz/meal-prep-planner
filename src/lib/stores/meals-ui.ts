import { create } from "zustand";

type MealsUiState = {
	selectedMealId: string | null;
	setSelectedMealId: (mealId: string | null) => void;
	clearSelection: () => void;
};

export const useMealsUiStore = create<MealsUiState>((set) => ({
	selectedMealId: null,
	setSelectedMealId: (mealId) => set({ selectedMealId: mealId }),
	clearSelection: () => set({ selectedMealId: null }),
}));
