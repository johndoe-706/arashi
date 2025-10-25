import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
    return NextResponse.json(
      {
        error:
          "Server misconfigured. Set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.",
      },
      { status: 500 }
    );
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, password_hash")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const match = bcrypt.compareSync(password, data.password_hash);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Successful: return ok. (We keep session client-side for now)
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("admin-login error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
