import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/auth";
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
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
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
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") || "10"));
  const offset = (page - 1) * pageSize;

  const rows = await query<AccountRow>(
    "SELECT * FROM accounts ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [pageSize, offset]
  );
  const countRows = await query<{ total: number }>(
    "SELECT COUNT(*) as total FROM accounts"
  );
  const total = countRows[0]?.total ?? 0;

  return NextResponse.json({
    data: rows.map(mapAccount),
    total,
  });
}

export async function POST(req: Request) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const payload = body?.account ?? body;

  if (!payload?.title || !payload?.description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const accountId = payload.id || randomUUID();
  const images = Array.isArray(payload.images) ? payload.images : [];
  const category = payload.category || "mobile_legend";

  await query(
    `INSERT INTO accounts
      (id, title, description, price, discount, category, skins, collector_level, images, is_sold, sold_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      accountId,
      payload.title,
      payload.description,
      Number(payload.price),
      payload.discount === undefined || payload.discount === null
        ? null
        : Number(payload.discount),
      category,
      Number(payload.skins || 0),
      payload.collector_level || null,
      JSON.stringify(images),
      payload.is_sold ? 1 : 0,
      payload.sold_at || null,
      payload.deleted_at || null,
    ]
  );

  return NextResponse.json({ ok: true, id: accountId });
}
