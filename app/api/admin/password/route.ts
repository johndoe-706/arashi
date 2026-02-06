import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type AdminUserRow = {
  password_hash: string;
};

export async function POST(req: Request) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Missing password fields" },
      { status: 400 }
    );
  }

  const rows = await query<AdminUserRow>(
    "SELECT password_hash FROM admin_users WHERE id = ? LIMIT 1",
    [session.id]
  );
  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const match = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!match) {
    return NextResponse.json({ error: "Invalid current password" }, { status: 401 });
  }

  const nextHash = bcrypt.hashSync(newPassword, 10);
  await query("UPDATE admin_users SET password_hash = ? WHERE id = ?", [
    nextHash,
    session.id,
  ]);

  return NextResponse.json({ ok: true });
}
