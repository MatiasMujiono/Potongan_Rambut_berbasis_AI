import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";


const dbUrl = new URL(process.env.DATABASE_URL!);

const poolConnection = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password || undefined,
  port: Number(dbUrl.port),
  database: dbUrl.pathname.replace("/", ""),
});

export const db = drizzle(poolConnection, {
  schema,
  mode: "default",
});
