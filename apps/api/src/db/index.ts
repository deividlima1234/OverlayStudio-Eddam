import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

// Por defecto usamos postgres:postgres si no hay variable de entorno
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/eddam_overlay';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
