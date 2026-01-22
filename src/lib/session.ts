import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type SessionInfo = {
	userId: string;
	jti: string;
};

export async function getSession(): Promise<SessionInfo | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
	if (!token) return null;

	const payload = verifyAuthToken(token);
	if (!payload) return null;

	const session = await prisma.session.findUnique({
		where: { jti: payload.jti },
	});
	if (!session || session.revokedAt || session.expiresAt < new Date())
		return null;

	return { userId: session.userId, jti: session.jti };
}

export async function requireSession(): Promise<SessionInfo> {
	const session = await getSession();
	if (!session) {
		redirect("/login");
	}
	return session;
}
