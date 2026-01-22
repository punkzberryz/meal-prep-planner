import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(254,243,199,0.85),_rgba(254,243,199,0.15)_45%,_rgba(248,250,252,1)_100%)]">
			<div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
				{children}
			</div>
		</div>
	);
}
