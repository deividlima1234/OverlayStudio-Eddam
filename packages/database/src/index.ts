import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars (useful when testing locally)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/eddam_overlay_studio';

// Disable prefetch as it is not supported for "Transaction" pool mode 
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export * from './schema.js';
