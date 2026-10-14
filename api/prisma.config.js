import 'dotenv/config';
import { defineConfig } from '@prisma/config';

// Prisma 7 reads the CLI's connection string from here rather than the schema;
// the runtime client gets it through the pg driver adapter in lib/prisma.js.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
