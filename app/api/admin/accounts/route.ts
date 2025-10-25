import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET;

export async function POST(req: Request) {
  if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Supabase keys" },
      { status: 500 }
    );
  }

  const adminSecret = req.headers.get("x-admin-secret");
  if (!ADMIN_API_SECRET || adminSecret !== ADMIN_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const accountData = body?.account;
  if (!accountData) {
    return NextResponse.json(
      { error: "Missing account payload" },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { data, error } = await supabaseAdmin
      .from("accounts")
      .insert(accountData);
    if (error) {
      console.error("Service insert error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("Admin accounts route error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
