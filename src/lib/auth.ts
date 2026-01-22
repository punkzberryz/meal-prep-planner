import jwt from "jsonwebtoken";

export const SESSION_COOKIE_NAME = "mealprep_session";

export type AuthTokenPayload = {
	sub: string;
	jti: string;
};

function getJwtSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET is not set");
	}
	return secret;
}

export function signAuthToken(payload: AuthTokenPayload, expiresAt: Date) {
	const seconds = Math.max(
		1,
		Math.floor((expiresAt.getTime() - Date.now()) / 1000),
	);
	return jwt.sign(payload, getJwtSecret(), { expiresIn: seconds });
}

export function verifyAuthToken(token: string) {
	try {
		return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
	} catch {
		return null;
	}
}
