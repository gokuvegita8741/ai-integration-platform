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
                    const { default: api } = await import('@/lib/api');

                    const { data } = await api.post('/api/v1/auth/login', {
                        email: credentials.email,
                        password: credentials.password,
                    });

                    // Return user object
                    return {
                        id: data.userId,
                        email: data.email,
                        name: data.fullName,

                        // Access Token Details
                        accessToken: data.access_token,
                        accessTokenExpires: data.expiresAt,
                    };
                } catch (error: any) {
                    console.error("Auth error:", error);
                    // Throw a user-friendly error message
                    throw new Error(error.message || 'Invalid email or password');
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
                console.log("user -> ", user)
                token.email = user.email;
                token.name = user.name;
                token.accessToken = user.accessToken;
                token.accessTokenExpires =
                    (user as any).accessTokenExpires;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.accessTokenExpires =
                token.accessTokenExpires as number;
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
