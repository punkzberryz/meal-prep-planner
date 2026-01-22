import { create } from "zustand";

type PlannerUiState = {
	selectedWeekStart: string | null;
	selectedDay: string | null;
	setSelectedWeekStart: (weekStart: string | null) => void;
	setSelectedDay: (day: string | null) => void;
	reset: () => void;
};

export const usePlannerUiStore = create<PlannerUiState>((set) => ({
	selectedWeekStart: null,
	selectedDay: null,
	setSelectedWeekStart: (weekStart) => set({ selectedWeekStart: weekStart }),
	setSelectedDay: (day) => set({ selectedDay: day }),
	reset: () => set({ selectedWeekStart: null, selectedDay: null }),
}));
