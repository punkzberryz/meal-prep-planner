import type { ReactNode } from "react";
import { Suspense } from "react";
import { AuthGuard, AuthGuardFallback } from "@/components/app/auth-guard";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AppPageProps = {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	children: ReactNode;
};

export function AppPage({ title, subtitle, actions, children }: AppPageProps) {
	return (
		<Suspense fallback={<AuthGuardFallback />}>
			<AuthGuard>
				<div className="min-h-svh">
					<header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900/10 bg-white/70 px-6 py-4 backdrop-blur">
						<div className="flex items-center gap-3">
							<SidebarTrigger />
							<div>
								{subtitle ? (
									<p className="text-sm text-emerald-900/70">{subtitle}</p>
								) : null}
								<h1 className="font-display text-2xl text-emerald-950">
									{title}
								</h1>
							</div>
						</div>
						{actions}
					</header>
					<main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
				</div>
			</AuthGuard>
		</Suspense>
	);
}
