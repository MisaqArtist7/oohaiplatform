import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies();
  const token = store.get("token")?.value;
  const userCookie = store.get("user")?.value;

  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  return NextResponse.json({
    authenticated: Boolean(token),
    user,
  });
}
