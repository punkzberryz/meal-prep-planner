import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/app/query-provider";
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
	icons: {
		icon: "/assets/icons/icon.jpg",
		shortcut: "/assets/icons/favicon.ico",
		apple: "/assets/icons/icon.jpg",
	},
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
				<QueryProvider>{children}</QueryProvider>
				<Toaster richColors />
			</body>
		</html>
	);
}
