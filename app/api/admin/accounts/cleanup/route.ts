import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { parseJsonArray, query } from "@/lib/db";
import { deleteUploadByUrl } from "@/lib/uploads";

export const runtime = "nodejs";

type AccountRow = {
  id: string;
  images: string | string[];
};

export async function POST() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await query<AccountRow>(
    "SELECT id, images FROM accounts WHERE deleted_at IS NOT NULL AND deleted_at < ?",
    [cutoff]
  );

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0, imagesDeleted: 0 });
  }

  let imagesDeleted = 0;
  for (const row of rows) {
    const images = parseJsonArray(row.images);
    await Promise.all(images.map((url) => deleteUploadByUrl(url)));
    imagesDeleted += images.length;
  }

  const ids = rows.map((row) => row.id);
  await query(
    `DELETE FROM accounts WHERE id IN (${ids.map(() => "?").join(",")})`,
    ids
  );

  return NextResponse.json({
    ok: true,
    deleted: rows.length,
    imagesDeleted,
  });
}
