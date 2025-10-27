// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

/**
 * OCP helpers: se o backend mudar os nomes dos campos,
 * basta estender estes pickers (sem tocar no fluxo principal).
 */
function pickAccessToken(data: any): string | undefined {
  return (
    data?.accessToken ||
    data?.jwt ||
    data?.token ||
    data?.bearer ||
    undefined
  );
}
function pickRefreshToken(data: any): string | undefined {
  return data?.refreshToken || data?.refresh_token || undefined;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/**
 * Troca id_token do Google pelos tokens próprios do backend.
 * Isolado p/ manter OCP.
 */
async function exchangeGoogleIdToken(idToken: string) {
  const resp = await axios.post(
    `${API_BASE}/api/auth/oauth/google`,
    { idToken },
    { headers: { "Content-Type": "application/json" } }
  );
  const data = resp.data ?? {};
  return {
    accessToken: pickAccessToken(data),
    refreshToken: pickRefreshToken(data),
  };
}

const options: NextAuthOptions = {
  session: { strategy: "jwt" }, // <-- importante
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Retorna um "User" básico + tokens em campos extras.
      // (OCP: parsing dos tokens fica nos helpers acima)
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        try {
          const resp = await axios.post(
            `${API_BASE}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            { headers: { "Content-Type": "application/json" } }
          );

          const data = resp.data ?? {};
          const accessToken = pickAccessToken(data);
          const refreshToken = pickRefreshToken(data);

          if (resp.status === 200 && accessToken) {
            return {
              id: credentials.email, // se o backend não manda ID, usamos o e-mail
              email: credentials.email,
              name: credentials.email,
              // campos extras (serão copiados no jwt callback)
              accessToken,
              refreshToken,
            } as any; // coerção leve p/ alinhar com NextAuth.User
          }
          return null;
        } catch (err: any) {
          // Evite vazar detalhes de backend para o usuário final
          throw new Error("Failed to authenticate");
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // sem overrides: usamos o id_token no callback jwt
    }),
  ],

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET!,

  callbacks: {
    /**
     * jwt: ponto único para consolidar tokens, mantendo o fluxo extensível.
     * - Credentials: pega tokens retornados pelo "authorize"
     * - Google: troca id_token -> tokens do backend (exchangeGoogleIdToken)
     */
    async jwt({ token, user, account }) {
      // 1) Fluxo Google: ao voltar do OAuth temos "account" populado.
      if (account?.provider === "google" && account?.id_token) {
        try {
          const { accessToken, refreshToken } = await exchangeGoogleIdToken(
            account.id_token
          );
          if (accessToken) token.accessToken = accessToken;
          if (refreshToken) token.refreshToken = refreshToken;
        } catch {
          // se der erro na troca, mantemos o jwt sem tokens próprios
          // (opcional: você pode lançar erro para bloquear o login)
        }
      }

      // 2) Fluxo Credentials: "user" contém os tokens extras do authorize
      if (user) {
        const u: any = user;
        token.id = u.id ?? token.id ?? u.email ?? null;
        token.email = u.email ?? token.email ?? null;
        token.name = u.name ?? token.name ?? null;

        // Se o authorize já trouxe tokens, persistimos
        if (u.accessToken) token.accessToken = u.accessToken;
        if (u.refreshToken) token.refreshToken = u.refreshToken;
      }

      return token;
    },

    /**
     * session: expõe tokens e campos mínimos no objeto de sessão.
     * Mantém compatibilidade com componentes existentes.
     */
    async session({ session, token }) {
      const id = (token.id ?? token.email ?? "") as string;
      const email = (token.email ??
        session.user?.email ??
        null) as string | null;
      const name = (token.name ??
        session.user?.name ??
        null) as string | null;

      const existingImage =
        (session.user &&
          typeof session.user === "object" &&
          "image" in session.user
          ? (session.user as any).image
          : null) || null;

      session.user = {
        ...(session.user ?? {}),
        id,
        email,
        name,
        image: existingImage,
      } as typeof session.user;

      (session as any).accessToken = token.accessToken as
        | string
        | undefined;
      (session as any).refreshToken = token.refreshToken as
        | string
        | undefined;

      return session;
    },
  },
};

export default NextAuth(options);
