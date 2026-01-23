import type { ReactNode } from "react";
import { Suspense } from "react";
import { AuthGuard, AuthGuardFallback } from "@/components/app/auth-guard";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AppPageProps = {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	fallback?: ReactNode;
	suspenseKey?: string;
	children: ReactNode;
};

export function AppPage({
	title,
	subtitle,
	actions,
	fallback,
	suspenseKey,
	children,
}: AppPageProps) {
	return (
		<Suspense
			key={suspenseKey ?? title}
			fallback={fallback ?? <AuthGuardFallback />}
		>
			<AuthGuard>
				<div className="min-h-svh">
					<header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card/70 px-6 py-4 backdrop-blur">
						<div className="flex items-center gap-3">
							<SidebarTrigger />
							<div>
								{subtitle ? (
									<p className="text-sm text-muted-foreground">{subtitle}</p>
								) : null}
								<h1 className="font-display text-2xl text-foreground">
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
