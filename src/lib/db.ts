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

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: ["error", "warn"],
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
