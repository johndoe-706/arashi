import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";

export type AdminSession = {
  id: string;
  email: string;
};

const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_JWT_SECRET");
  }
  return secret;
};

export function signAdminSession(session: AdminSession) {
  return jwt.sign(session, getJwtSecret(), { expiresIn: "7d" });
}

export function getAdminSession(): AdminSession | null {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, getJwtSecret()) as AdminSession;
  } catch {
    return null;
  }
}
