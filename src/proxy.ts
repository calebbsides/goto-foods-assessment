import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/cookies";

export const config = {
  matcher: ["/orders/:path*", "/api/:path*"],
};

const HOST_ONLY = /^\/orders\/[^/]+\/checkout/;

export function proxy(request: NextRequest): NextResponse {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  if (HOST_ONLY.test(pathname) && !request.cookies.get(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  console.log(
    JSON.stringify({
      severity: "INFO",
      message: "request",
      method: request.method,
      path: pathname,
      durationMs: Date.now() - start,
    }),
  );
  return response;
}
