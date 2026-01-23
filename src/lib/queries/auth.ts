import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/queries/api";
import { queryKeys } from "@/lib/query-keys";

export type AuthUser = {
	id: string;
	email: string;
	name: string | null;
	createdAt: string;
	updatedAt: string;
};

type AuthMeResponse = {
	user: AuthUser | null;
};

type LoginPayload = {
	email: string;
	password: string;
};

type RegisterPayload = {
	email: string;
	password: string;
	name?: string;
};

type UpdateProfilePayload = {
	name: string | null;
};

type ChangePasswordPayload = {
	currentPassword: string;
	nextPassword: string;
};

export function useAuthMe() {
	return useQuery({
		queryKey: queryKeys.auth.me,
		queryFn: () =>
			apiJson<AuthMeResponse>("/api/auth/me", undefined, {
				acceptStatuses: [401],
			}),
	});
}

export function useRefreshSession(enabled: boolean) {
	return useQuery({
		queryKey: queryKeys.auth.refresh,
		queryFn: () =>
			apiJson<AuthMeResponse>(
				"/api/auth/refresh",
				{ method: "POST" },
				{ acceptStatuses: [401] },
			),
		enabled,
		refetchInterval: 1000 * 60 * 30,
		refetchIntervalInBackground: true,
	});
}

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: LoginPayload) =>
			apiJson<AuthMeResponse>("/api/auth/login", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
		onSuccess: (data) => {
			if (data.user) {
				queryClient.setQueryData(queryKeys.auth.me, { user: data.user });
			}
		},
	});
}

export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: RegisterPayload) =>
			apiJson<AuthMeResponse>("/api/auth/register", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
		onSuccess: (data) => {
			if (data.user) {
				queryClient.setQueryData(queryKeys.auth.me, { user: data.user });
			}
		},
	});
}

export function useLogout() {
	return useMutation({
		mutationFn: () =>
			apiJson("/api/auth/logout", {
				method: "POST",
			}),
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateProfilePayload) =>
			apiJson<AuthMeResponse>("/api/auth/me", {
				method: "PATCH",
				body: JSON.stringify(payload),
			}),
		onSuccess: (data) => {
			queryClient.setQueryData(queryKeys.auth.me, {
				user: data.user ?? null,
			});
		},
	});
}

export function useChangePassword() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ChangePasswordPayload) =>
			apiJson<AuthMeResponse>("/api/auth/password", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
		onSuccess: (data) => {
			queryClient.setQueryData(queryKeys.auth.me, {
				user: data.user ?? null,
			});
		},
	});
}
