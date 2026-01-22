import { useMutation, useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/queries/api";
import { queryKeys } from "@/lib/query-keys";

export type AuthUser = {
	id: string;
	email: string;
	name: string | null;
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

export function useAuthMe() {
	return useQuery({
		queryKey: queryKeys.auth.me,
		queryFn: () =>
			apiJson<AuthMeResponse>("/api/auth/me", undefined, {
				acceptStatuses: [401],
			}),
	});
}

export function useLogin() {
	return useMutation({
		mutationFn: (payload: LoginPayload) =>
			apiJson("/api/auth/login", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
	});
}

export function useRegister() {
	return useMutation({
		mutationFn: (payload: RegisterPayload) =>
			apiJson("/api/auth/register", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
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
