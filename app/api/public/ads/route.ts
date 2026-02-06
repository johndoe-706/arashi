import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type AdRow = {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  order_index: number;
  is_active: number | boolean;
  created_at: string;
};

const mapAd = (row: AdRow) => ({
  ...row,
  is_active: Boolean(row.is_active),
});

export async function GET() {
  const rows = await query<AdRow>(
    "SELECT * FROM ads WHERE is_active = 1 ORDER BY order_index ASC"
  );
  return NextResponse.json({ data: rows.map(mapAd) });
}
