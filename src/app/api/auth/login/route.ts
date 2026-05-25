import { NextResponse } from "next/server";
import {
  isValidOwnerCredentials,
  ownerSessionCookieOptions,
} from "@/lib/owner-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidOwnerCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ownerSessionCookieOptions());
  return response;
}
