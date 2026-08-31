import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
        url: process.env.DATABASE_URL || "mysql://root:Akudavid123@mysql:3306/usersDatabase",
    },
});
