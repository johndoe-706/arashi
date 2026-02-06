

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { parseJsonArray, query } from "@/lib/db";
import { deleteUploadByUrl } from "@/lib/uploads";

export const runtime = "nodejs";

type AccountRow = {
  images: string | string[];
};

const ALLOWED_FIELDS = new Set([
  "title",
  "description",
  "price",
  "discount",
  "category",
  "skins",
  "collector_level",
  "images",
  "is_sold",
  "sold_at",
  "deleted_at",
]);

// Add proper type for params
interface RouteParams {
  params: { id: string };
}

export async function PATCH(
  req: Request,
  { params }: RouteParams // Correct destructuring
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    const payload = await req.json();
    console.log("PATCH request for account:", id, "payload:", payload);

    const updates: string[] = [];
    const paramsArray: any[] = [];

    for (const [key, value] of Object.entries(payload || {})) {
      if (!ALLOWED_FIELDS.has(key)) continue;

      if (key === "images") {
        updates.push(`${key} = ?`);
        paramsArray.push(JSON.stringify(Array.isArray(value) ? value : []));
        continue;
      }

      if (key === "price" || key === "discount" || key === "skins") {
        updates.push(`${key} = ?`);
        paramsArray.push(value === null ? null : Number(value));
        continue;
      }

      if (key === "is_sold") {
        updates.push(`${key} = ?`);
        paramsArray.push(value ? 1 : 0);
        continue;
      }

      updates.push(`${key} = ?`);
      paramsArray.push(value ?? null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    // Add ID as the last parameter
    paramsArray.push(id);
    
    // Log the SQL query for debugging
    const sql = `UPDATE accounts SET ${updates.join(", ")} WHERE id = ?`;
    console.log("Executing SQL:", sql, "with params:", paramsArray);

    await query(sql, paramsArray);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in PATCH handler:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



export async function DELETE(
  _req: Request,
  { params }: RouteParams
) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    const rows = await query<AccountRow>(
      "SELECT images FROM accounts WHERE id = ? LIMIT 1",
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    
    const images = rows[0] ? parseJsonArray(rows[0].images) : [];
    
    // Add debug logging
    console.log("Deleting account ID:", id);
    console.log("Images to delete:", images);

    // Delete images first (make sure to await it!)
    if (images.length > 0) {
      try {
        // ADD AWAIT HERE - This was missing!
        await Promise.all(images.map((url) => {
          console.log("Deleting image:", url);
          return deleteUploadByUrl(url);
        }));
        console.log("All images deleted successfully");
      } catch (err) {
        console.error("Error deleting images:", err);
        // Continue with account deletion even if image deletion fails
      }
    }

    // Then delete the account from database
    await query("DELETE FROM accounts WHERE id = ?", [id]);
    console.log("Account deleted from database");

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in DELETE handler:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}