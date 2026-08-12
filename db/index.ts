import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

const globalForDb = globalThis as unknown as { __getlnkDb?: ReturnType<typeof createDb> };

export const db = globalForDb.__getlnkDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__getlnkDb = db;
}
