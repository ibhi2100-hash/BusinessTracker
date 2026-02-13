import type { NextAuthOptions } from 'next-Auth';
import { CredentialsProvider } from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email"},
                password: { label: "Password", type: "Password" }
            },

            async authorize(credentials) {
                if(!credentials?.email  || !credentials?.password){
                    return null
                }

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json"},
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    }
                );

                if (!res.ok) return null;

                const data = await res.json();

                return {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    businessId: data.user.businessId,
                    accessToken: data.token,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },

    callbacks: {
        async jwt({ token, user}) {
            if(user) {
                token.id = user.id;
                token.businessId = user.businessId;
                token.accessToken = (user as any ).accessToken;
            }
            return token;
        },
        
        async session({ session, token }) {
            if(session.user) {
                session.user.id = token.id as string;
                session.user.businessId = token.businessId as string;
                session.accessToken = token.accessToken as string;
            }

            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "auth/signin",
    },
};