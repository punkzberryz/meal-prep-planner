import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SESSION_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

type AuthGuardProps = {
	children: ReactNode;
};

async function requireSession() {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
	if (!token) {
		redirect("/login");
	}

	const payload = verifyAuthToken(token);
	if (!payload) {
		redirect("/login");
	}

	const session = await prisma.session.findUnique({
		where: { jti: payload.jti },
	});

	if (!session || session.revokedAt || session.expiresAt < new Date()) {
		redirect("/login");
	}
}

export async function AuthGuard({ children }: AuthGuardProps) {
	await requireSession();
	return <>{children}</>;
}

export function AuthGuardFallback() {
	return (
		<div className="flex min-h-[40vh] items-center justify-center text-sm text-emerald-900/70">
			Checking your session...
		</div>
	);
}
