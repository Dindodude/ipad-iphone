import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getExpectedSessionToken } from "@/lib/auth";

function isAuthenticated(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value === getExpectedSessionToken();
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  if ((pathname === "/login" || pathname.startsWith("/login/")) && authenticated) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname === "/app" || pathname.startsWith("/app/") || pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!authenticated) {
      const loginUrl = new URL("/login", request.url);
      const nextValue = pathname === "/dashboard" ? "/app" : `${pathname}${search}`;
      loginUrl.searchParams.set("next", nextValue);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/login"]
};
