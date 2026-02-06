import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type RankBoostRow = {
  id: string;
  title: string;
  price: number | string;
  created_at: string;
};

const mapRankBoost = (row: RankBoostRow) => ({
  ...row,
  price: Number(row.price),
});

export async function GET(req: Request) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") || "10"));
  const offset = (page - 1) * pageSize;

  const rows = await query<RankBoostRow>(
    "SELECT * FROM rank_boost ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [pageSize, offset]
  );
  const countRows = await query<{ total: number }>(
    "SELECT COUNT(*) as total FROM rank_boost"
  );

  return NextResponse.json({
    data: rows.map(mapRankBoost),
    total: countRows[0]?.total ?? 0,
  });
}

export async function POST(req: Request) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const payload = body?.rankBoost ?? body;

  if (!payload?.title) {
    return NextResponse.json(
      { error: "Missing title" },
      { status: 400 }
    );
  }

  const rankBoostId = payload.id || randomUUID();

  await query(
    `INSERT INTO rank_boost (id, title, price)
     VALUES (?, ?, ?)`,
    [rankBoostId, payload.title, Number(payload.price || 0)]
  );

  return NextResponse.json({ ok: true, id: rankBoostId });
}
