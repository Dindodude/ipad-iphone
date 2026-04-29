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
    return NextResponse.redirect(new URL("/admin-portal", request.url));
  }

  if ((pathname === "/client-builder/login" || pathname.startsWith("/client-builder/login/")) && authenticated) {
    return NextResponse.redirect(new URL("/client-builder", request.url));
  }

  if (
    pathname === "/app"
    || pathname.startsWith("/app/")
    || pathname === "/admin-portal"
    || pathname.startsWith("/admin-portal/")
    || pathname === "/dashboard"
    || pathname.startsWith("/dashboard/")
    || pathname === "/cold-calls"
    || pathname.startsWith("/cold-calls/")
    || (pathname.startsWith("/client-builder") && pathname !== "/client-builder/login" && !pathname.startsWith("/client-builder/login/"))
  ) {
    if (!authenticated) {
      const loginPath = pathname.startsWith("/client-builder") ? "/client-builder/login" : "/login";
      const loginUrl = new URL(loginPath, request.url);
      const nextValue = pathname === "/dashboard" ? "/app" : `${pathname}${search}`;
      loginUrl.searchParams.set("next", nextValue);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin-portal/:path*", "/dashboard/:path*", "/cold-calls", "/cold-calls/:path*", "/client-builder/:path*", "/login"]
};
