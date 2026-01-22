import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
	const cookieStore = cookies();
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

	if (token) {
		const payload = verifyAuthToken(token);
		if (payload?.jti) {
			await prisma.session.updateMany({
				where: { jti: payload.jti, revokedAt: null },
				data: { revokedAt: new Date() },
			});
		}
	}

	const response = NextResponse.json({ ok: true });
	response.cookies.set(SESSION_COOKIE_NAME, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		expires: new Date(0),
	});
	return response;
}
