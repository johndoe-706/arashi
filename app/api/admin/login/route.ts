import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signAdminSession, ADMIN_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  const rows = await query<AdminUserRow>(
    "SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1",
    [String(email).trim().toLowerCase()]
  );

  const user = rows[0];
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const match = bcrypt.compareSync(password, user.password_hash);
  if (!match) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = signAdminSession({ id: user.id, email: user.email });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
