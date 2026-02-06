import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:
        process.env.MYSQL_HOST ||
        process.env.DB_HOST ||
        "localhost",
      port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || "3306"),
      user: process.env.MYSQL_USER || process.env.DB_USER,
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []) {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string") as string[];
  }

  if (typeof value === "string" && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string") as string[];
      }
    } catch {
      return [];
    }
  }

  return [];
}
