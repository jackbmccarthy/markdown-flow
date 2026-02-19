import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isSettings = nextUrl.pathname.startsWith("/settings");
      const isLogin = nextUrl.pathname === "/login";

      console.log(`[Middleware] Path: ${nextUrl.pathname} | LoggedIn: ${isLoggedIn}`);

      if (isDashboard || isSettings) {
        if (isLoggedIn) return true;
        console.log(`[Middleware] Redirecting to login...`);
        return false; // Redirects to sign-in
      } else if (isLoggedIn && isLogin) {
        console.log(`[Middleware] Redirecting to dashboard...`);
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
