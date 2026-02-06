import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

const ALLOWED_FIELDS = new Set(["title", "price"]);

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
    if (key === "price") {
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
  await query(
    `UPDATE rank_boost SET ${updates.join(", ")} WHERE id = ?`,
    params
  );

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
  await query("DELETE FROM rank_boost WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
