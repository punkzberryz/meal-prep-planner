import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
	SESSION_COOKIE_NAME,
	signAuthToken,
	verifyAuthToken,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function clearAuthCookie() {
	const response = NextResponse.json({ user: null }, { status: 401 });
	response.cookies.set(SESSION_COOKIE_NAME, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		expires: new Date(0),
	});
	return response;
}

export async function POST() {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

	if (!token) {
		return clearAuthCookie();
	}

	const payload = verifyAuthToken(token);
	if (!payload) {
		return clearAuthCookie();
	}

	const session = await prisma.session.findUnique({
		where: { jti: payload.jti },
		include: { user: true },
	});

	if (!session || session.revokedAt || session.expiresAt < new Date()) {
		return clearAuthCookie();
	}

	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
	await prisma.session.update({
		where: { id: session.id },
		data: { expiresAt },
	});

	const refreshedToken = signAuthToken(
		{ sub: session.userId, jti: session.jti },
		expiresAt,
	);
	const response = NextResponse.json({
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
		},
	});

	response.cookies.set(SESSION_COOKIE_NAME, refreshedToken, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		expires: expiresAt,
	});

	return response;
}
