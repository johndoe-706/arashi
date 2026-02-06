import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type RankBoostRow = {
  id: string;
  title: string;
  price: number | string;
  created_at: string;
};

export async function GET() {
  const rows = await query<RankBoostRow>(
    "SELECT * FROM rank_boost ORDER BY created_at DESC"
  );
  return NextResponse.json({
    data: rows.map((row) => ({ ...row, price: Number(row.price) })),
  });
}
