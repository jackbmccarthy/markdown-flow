import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "@/auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string(), password: z.string() })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          
          const adminUsername = process.env.ADMIN_USERNAME;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (email === adminUsername && password === adminPassword) {
            return {
              id: "1",
              name: "Admin",
              email: adminUsername,
            }
          }
        }

        return null
      },
    }),
  ],
})
