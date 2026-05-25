import { cookies } from "next/headers";

export const OWNER_COOKIE_NAME = "owner_session";
const OWNER_SESSION_VALUE = "owner-authenticated";
const OWNER_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const OWNER_USERNAME = process.env.OWNER_USERNAME || "Owner";
export const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@1234";

export function isValidOwnerCredentials(username: string, password: string) {
  return username === OWNER_USERNAME && password === OWNER_PASSWORD;
}

export async function hasOwnerSession() {
  const cookieStore = await cookies();
  return cookieStore.get(OWNER_COOKIE_NAME)?.value === OWNER_SESSION_VALUE;
}

export function ownerSessionCookieOptions() {
  return {
    name: OWNER_COOKIE_NAME,
    value: OWNER_SESSION_VALUE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OWNER_SESSION_MAX_AGE,
  };
}
