import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { deleteUploadByUrl } from "@/lib/uploads";

export const runtime = "nodejs";

type AdRow = {
  image_url: string;
};

const ALLOWED_FIELDS = new Set([
  "image_url",
  "title",
  "link",
  "order_index",
  "is_active",
]);

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params;
  const payload = await req.json();

  const updates: string[] = [];
  const params: any[] = [];

  for (const [key, value] of Object.entries(payload || {})) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    if (key === "is_active") {
      updates.push(`${key} = ?`);
      params.push(value ? 1 : 0);
      continue;
    }
    if (key === "order_index") {
      updates.push(`${key} = ?`);
      params.push(Number(value || 0));
      continue;
    }
    updates.push(`${key} = ?`);
    params.push(value ?? null);
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided" },
      { status: 400 }
    );
  }

  params.push(id);
  await query(`UPDATE ads SET ${updates.join(", ")} WHERE id = ?`, params);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params;
  const rows = await query<AdRow>(
    "SELECT image_url FROM ads WHERE id = ? LIMIT 1",
    [id]
  );
  if (rows[0]?.image_url) {
    await deleteUploadByUrl(rows[0].image_url);
  }

  await query("DELETE FROM ads WHERE id = ?", [id]);

  return NextResponse.json({ ok: true });
}
