import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

export default defineConfig({
	datasource: {
		url: databaseUrl,
	},
});
