import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

type JWT = {
  [key: string]: any;
};

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing credentials");
        }

        try {
          const response = await axios.post(
            "https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const data = response.data;

          // ✅ Verifica se veio o token e o email
          if (response.status === 200 && data.access_token && data.email) {
            return {
              id: data.id ?? data.email, // ou algum UUID, se houver
              email: data.email,
              name: data.name ?? data.email,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            };
          } else {
            console.warn("Resposta inesperada da API de login:", data);
            return null;
          }
        } catch (error: any) {
          console.error(
            "Erro na autenticação:",
            error?.response?.data || error.message
          );
          throw new Error("Failed to authenticate");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token, user, account, profile }): Promise<JWT> {
      if (account?.provider === "google" && profile?.sub) {
        token.sub = profile.sub;
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name || user.email;
      }

      return token;
    },
    async session({ session, token }): Promise<Session> {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
      };

      return session;
    },
  },
};

export default NextAuth(options);
