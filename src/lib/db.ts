import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl =
	process.env.DATABASE_URL ??
	process.env.PRISMA_DATABASE_URL ??
	"file:./dev.db";

if (!databaseUrl.startsWith("file:") && databaseUrl !== ":memory:") {
	throw new Error('DATABASE_URL must start with "file:" for SQLite.');
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

function createPrismaClient() {
	return new PrismaClient({
		adapter,
		log: ["error", "warn"],
	});
}

function isStaleClient(client: PrismaClient) {
	// In dev, hot-reloading can keep an old PrismaClient instance around in globalThis
	// even after running migrations/generate. Detect missing delegates and recreate.
	return (
		typeof (client as unknown as { weeklyPlan?: unknown }).weeklyPlan ===
		"undefined"
	);
}

export const prisma =
	globalForPrisma.prisma && !isStaleClient(globalForPrisma.prisma)
		? globalForPrisma.prisma
		: createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
