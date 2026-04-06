import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireRole(role: "buyer" | "seller" | "admin") {
  const session = await requireSession();
  if (session.user.role !== role && session.user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}
