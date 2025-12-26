import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// This is a stub file to satisfy project structure requirements.
// The actual application uses in-memory storage as requested.

const { Pool } = pg;

// Dummy pool to prevent crashes if something tries to import it, 
// though we won't use it for logic.
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db" 
});

// We cast this to any because we won't actually connect to a DB
export const db = drizzle(pool, { schema });
