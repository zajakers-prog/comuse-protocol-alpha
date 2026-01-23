import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Test Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;
                const email = credentials.email as string;

                try {
                    // Find or create user for testing
                    let user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        user = await prisma.user.create({
                            data: { email, name: email.split("@")[0] }
                        });
                    }
                    return user;
                } catch (error) {
                    console.error("DB Login failed, falling back to mock user:", error);
                    // Fallback for Demo/VC even if DB is broken
                    return {
                        id: "demo-user-fallback",
                        email: email,
                        name: "Demo Guest (Offline)"
                    };
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
});
