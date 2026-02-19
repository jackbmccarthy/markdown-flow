import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/db"
import { User } from "@/entities/User"
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
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const db = await getDb()
          const user = await db.getRepository(User).findOneBy({ email })
          if (!user) return null
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (passwordsMatch) return user
        }

        return null
      },
    }),
  ],
})
