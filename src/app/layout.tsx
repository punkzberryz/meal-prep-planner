import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
});

const fraunces = Fraunces({
	variable: "--font-fraunces",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Meal Prep Planner",
	description: "Plan weekly meals, manage groceries, and keep cooking calm.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased`}
			>
				{children}
				<Toaster richColors />
			</body>
		</html>
	);
}
