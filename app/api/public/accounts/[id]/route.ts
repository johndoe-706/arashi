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

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const rows = await query<AccountRow>(
    "SELECT * FROM accounts WHERE id = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...row,
      price: Number(row.price),
      discount: row.discount === null ? null : Number(row.discount),
      skins: Number(row.skins || 0),
      images: parseJsonArray(row.images),
      is_sold: Boolean(row.is_sold),
    },
  });
}
