import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "@/auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string() })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data
          
          const adminUsername = process.env.ADMIN_USERNAME;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (username === adminUsername && password === adminPassword) {
            return {
              id: "1",
              email: adminUsername,
            }
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email; // Admin username
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
})
