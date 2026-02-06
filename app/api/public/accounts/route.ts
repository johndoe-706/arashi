import { NextResponse } from "next/server";
import { parseJsonArray, query } from "@/lib/db";

export const runtime = "nodejs";

type AccountRow = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  discount: number | string | null;
  category: string;
  skins: number | string;
  collector_level: string | null;
  images: string | string[];
  is_sold: number | boolean;
  sold_at: string | null;
  created_at: string;
};

const mapAccount = (row: AccountRow) => ({
  ...row,
  price: Number(row.price),
  discount: row.discount === null ? null : Number(row.discount),
  skins: Number(row.skins || 0),
  images: parseJsonArray(row.images),
  is_sold: Boolean(row.is_sold),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") || "12"));
  const limit = searchParams.get("limit");
  const queryText = searchParams.get("q");
  const includeSold = searchParams.get("includeSold") !== "false";

  const where: string[] = [];
  const params: any[] = [];

  if (queryText) {
    where.push("title LIKE ?");
    params.push(`%${queryText}%`);
  }

  if (!includeSold) {
    where.push("is_sold = 0");
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  if (limit) {
    const limitValue = Math.max(1, Number(limit));
    const rows = await query<AccountRow>(
      `SELECT * FROM accounts ${whereSql} ORDER BY created_at DESC LIMIT ?`,
      [...params, limitValue]
    );
    return NextResponse.json({ data: rows.map(mapAccount) });
  }

  const offset = (page - 1) * pageSize;
  const rows = await query<AccountRow>(
    `SELECT * FROM accounts ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  const countRows = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM accounts ${whereSql}`,
    params
  );

  return NextResponse.json({
    data: rows.map(mapAccount),
    total: countRows[0]?.total ?? 0,
  });
}
