export const queryKeys = {
	auth: {
		me: ["auth", "me"] as const,
		refresh: ["auth", "refresh"] as const,
	},
	meals: {
		list: ["meals", "list"] as const,
		detail: (mealId: string) => ["meals", "detail", mealId] as const,
	},
	plans: {
		weekBase: ["plans", "week"] as const,
		week: (weekStart?: string | null) =>
			["plans", "week", weekStart ?? "current"] as const,
	},
	grocery: {
		weekBase: ["grocery", "week"] as const,
		week: (weekStart?: string | null) =>
			["grocery", "week", weekStart ?? "current"] as const,
	},
};
