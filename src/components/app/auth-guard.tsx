import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";

type AuthGuardProps = {
	children: ReactNode;
};

async function requireSession() {
	const session = await getSession();
	if (!session) {
		redirect("/login");
	}
}

export async function AuthGuard({ children }: AuthGuardProps) {
	await requireSession();
	return <>{children}</>;
}

export function AuthGuardFallback() {
	return (
		<div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
			Checking your session...
		</div>
	);
}
