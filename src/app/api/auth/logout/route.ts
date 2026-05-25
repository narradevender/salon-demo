import { NextResponse } from "next/server";
import { OWNER_COOKIE_NAME } from "@/lib/owner-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: OWNER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
