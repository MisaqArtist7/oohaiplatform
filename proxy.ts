import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token =
    req.cookies.get("access_token")?.value ||
    req.cookies.get("token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("return_to", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/media-owner/:path*"],
};
