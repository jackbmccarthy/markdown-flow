import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = "secret";
const key = new TextEncoder().encode(process.env.AUTH_SECRET || secretKey);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isSettings = request.nextUrl.pathname.startsWith("/settings");
  const isLogin = request.nextUrl.pathname === "/login";

  if (isDashboard || isSettings) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      await jwtVerify(session, key, {
        algorithms: ["HS256"],
      });
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isLogin && session) {
    try {
      await jwtVerify(session, key, {
        algorithms: ["HS256"],
      });
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
      // Invalid session, let them log in
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login"],
};
