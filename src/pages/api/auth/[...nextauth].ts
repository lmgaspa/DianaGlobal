import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

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
          const resp = await axios.post(
            "https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/login",
            { email: credentials.email, password: credentials.password },
            { headers: { "Content-Type": "application/json" } }
          );

          const data = resp.data || {};
          // aceita vários formatos do backend:
          const accessToken =
            data.accessToken || data.jwt || data.token || data.bearer || null;
          const refreshToken = data.refreshToken || data.refresh_token || null;

          if (resp.status === 200 && accessToken) {
            return {
              id: credentials.email,        // se o backend não retorna ID, use o e-mail
              email: credentials.email,
              name: credentials.email,
              accessToken,
              refreshToken: refreshToken ?? undefined,
            };
          }
          return null;
        } catch (err: any) {
          console.error("Auth error:", err?.response?.data || err.message);
          throw new Error("Failed to authenticate");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = (user as any).id ?? token.id ?? (user as any).email ?? null;
      token.email = (user as any).email ?? token.email ?? null;
      token.name = (user as any).name ?? token.name ?? null;
      token.accessToken = (user as any).accessToken;
      token.refreshToken = (user as any).refreshToken;
    }
    return token;
  },

  async session({ session, token }) {
    const id = (token.id ?? token.email ?? "") as string;
    const email = (token.email ?? session.user?.email ?? null) as string | null;
    const name  = (token.name  ?? session.user?.name  ?? null) as string | null;

    // compute image separately to avoid reading session.user inside the creation branch
    const existingImage =
      (session.user && typeof session.user === "object" && "image" in session.user
        ? (session.user as any).image
        : null) as string | null;

    session.user = {
      ...(session.user ?? {}),
      id,
      email,
      name,
      image: existingImage,
    } as typeof session.user;

    (session as any).accessToken  = token.accessToken as string | undefined;
    (session as any).refreshToken = token.refreshToken as string | undefined;

    return session;
  },
}
};

export default NextAuth(options);
