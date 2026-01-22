export const queryKeys = {
	auth: {
		me: ["auth", "me"] as const,
	},
	meals: {
		list: ["meals", "list"] as const,
		detail: (mealId: string) => ["meals", "detail", mealId] as const,
	},
	plans: {
		week: (weekStart?: string | null) =>
			["plans", "week", weekStart ?? "current"] as const,
	},
	grocery: {
		week: (weekStart?: string | null) =>
			["grocery", "week", weekStart ?? "current"] as const,
	},
};
