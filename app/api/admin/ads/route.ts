import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/auth";
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
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await query<AdRow>(
    "SELECT * FROM ads ORDER BY order_index ASC"
  );
  return NextResponse.json({ data: rows.map(mapAd) });
}

export async function POST(req: Request) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const payload = body?.ad ?? body;

  if (!payload?.image_url) {
    return NextResponse.json(
      { error: "Missing image_url" },
      { status: 400 }
    );
  }

  const adId = payload.id || randomUUID();

  await query(
    `INSERT INTO ads (id, image_url, title, link, order_index, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      adId,
      payload.image_url,
      payload.title || null,
      payload.link || null,
      Number(payload.order_index || 0),
      payload.is_active === false ? 0 : 1,
    ]
  );

  return NextResponse.json({ ok: true, id: adId });
}
