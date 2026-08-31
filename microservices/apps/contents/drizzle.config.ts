import { defineConfig } from "drizzle-kit";
export default defineConfig({
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgresql://postgres:Akudavid123@localhost:5432/risetproject",
    },
    schema: './src/db/schema.ts',
    out: 'drizzle/',
});