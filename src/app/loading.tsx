import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(246,214,120,0.65),_rgba(255,244,230,0.35)_45%,_rgba(255,244,230,1)_100%)]">
			<div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
				<Card className="w-full border-border bg-card/80 shadow-xl backdrop-blur">
					<CardHeader>
						<CardTitle className="font-display text-xl text-foreground">
							Loading your plan
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div
							aria-hidden="true"
							className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-4"
						>
							<div
								aria-hidden="true"
								className="absolute inset-0 opacity-40"
								style={{
									backgroundImage:
										"url('/assets/illustrations/loading-accent.webp')",
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							/>
							<div className="relative space-y-3">
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						</div>
						<p className="text-sm text-muted-foreground">
							One moment while we prepare your workspace.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
