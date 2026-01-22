"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthMe, useRefreshSession } from "@/lib/queries/auth";
import { queryKeys } from "@/lib/query-keys";

export function AuthRefresh() {
	const queryClient = useQueryClient();
	const { data } = useAuthMe();
	const refresh = useRefreshSession(Boolean(data?.user));

	useEffect(() => {
		if (!refresh.data) return;
		queryClient.setQueryData(queryKeys.auth.me, {
			user: refresh.data.user ?? null,
		});
	}, [queryClient, refresh.data]);

	return null;
}
