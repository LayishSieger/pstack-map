import { NextResponse, type NextRequest } from "next/server";
import { prefersMarkdown } from "@/lib/negotiate";

export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  if (!prefersMarkdown(accept)) return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/md/") || pathname.startsWith("/_next/")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/md/home" : `/md${pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
