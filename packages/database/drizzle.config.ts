import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/eddam_overlay_studio',
  }
} satisfies Config;
