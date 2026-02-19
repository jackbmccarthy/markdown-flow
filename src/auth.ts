import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getDb } from "@/lib/db"
import { User } from "@/entities/User"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                try {
                    const db = await getDb();
                    const user = await db.getRepository(User).findOneBy({ email: credentials.username as string });

                    if (!user) return null;

                    // Simple string check for our initial ENV_AUTH password bypass
                    if (user.passwordHash === "ENV_AUTH" && credentials.password === process.env.ADMIN_PASSWORD) {
                        return { id: user.id, email: user.email };
                    }

                    const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
                    if (!isValid) return null;

                    return { id: user.id, email: user.email };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
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
    pages: {
        signIn: '/login',
    }
})
