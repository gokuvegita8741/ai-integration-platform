import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                try {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
                    const res = await fetch(`${backendUrl}/api/v1/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (!res.ok) {
                        throw new Error('Invalid email or password');
                    }

                    const data = await res.json();

                    // Return user object
                    return {
                        id: data.userId,
                        email: data.email,
                        name: data.fullName,
                        accessToken: data.access_token,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw new Error(`Error in auth: ${error}`);
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.email = (user as any).email;
                token.name = (user as any).name;
                token.accessToken = (user as any).accessToken;
                token.id = (user as any).id;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
};
