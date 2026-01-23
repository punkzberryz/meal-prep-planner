import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME, signAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

const RegisterSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
	const body = await request.json().catch(() => null);
	const parsed = RegisterSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid input." }, { status: 400 });
	}

	const { email, password, name } = parsed.data;
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		return NextResponse.json(
			{ error: "Email already in use." },
			{ status: 409 },
		);
	}

	const passwordHash = await hashPassword(password);
	const user = await prisma.user.create({
		data: { email, name, passwordHash },
	});

	const jti = randomUUID();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

	await prisma.session.create({
		data: { userId: user.id, jti, expiresAt },
	});

	const token = signAuthToken({ sub: user.id, jti }, expiresAt);
	const response = NextResponse.json({
		user: { id: user.id, email: user.email, name: user.name },
	});

	response.cookies.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		expires: expiresAt,
	});

	return response;
}
