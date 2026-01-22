import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(246,214,120,0.75),_rgba(255,244,230,0.3)_45%,_rgba(255,244,230,1)_100%)]">
			<div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
				{children}
			</div>
		</div>
	);
}
