import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isSettings = req.nextUrl.pathname.startsWith("/settings");
  const isLogin = req.nextUrl.pathname === "/login";

  if (isDashboard || isSettings) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  }

  if (isLogin && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
