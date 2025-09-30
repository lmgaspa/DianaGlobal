import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

/** ==== Config & helpers (OCP: pontos de extensão centralizados) ==== */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/** Normaliza respostas do backend (se mudar chaves, só alterar aqui) */
function normalizeBackendAuth(data: any) {
  const accessToken =
    data?.accessToken ?? data?.jwt ?? data?.token ?? data?.bearer ?? undefined;
  const refreshToken = data?.refreshToken ?? data?.refresh_token ?? undefined;
  return { accessToken, refreshToken };
}

/** Troca opcional do ID token do Google por JWT próprio do backend */
async function exchangeGoogleIdTokenForAppTokens(idToken: string) {
  // Habilite a troca no backend quando /api/auth/oauth/google estiver pronto
  if (process.env.NEXT_PUBLIC_GOOGLE_BACKEND_EXCHANGE === "true") {
    const resp = await axios.post(
      `${API_BASE}/api/auth/oauth/google`,
      { idToken },
      { headers: { "Content-Type": "application/json" } }
    );
    return normalizeBackendAuth(resp.data);
  }
  // Fallback: sem troca, devolve o idToken como accessToken “temporário”
  return { accessToken: idToken, refreshToken: undefined };
}

/** Cria um objeto “user auth payload” uniforme */
function buildUserAuthPayload(params: {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  accessToken?: string | undefined;
  refreshToken?: string | undefined;
}) {
  return {
    id: params.id ?? params.email ?? "", // garante string
    email: params.email ?? undefined,
    name: params.name ?? undefined,
    accessToken: params.accessToken,
    refreshToken: params.refreshToken,
  };
}

/** ================================================================ */

export const authOptions: NextAuthOptions = {
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
            `${API_BASE}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            { headers: { "Content-Type": "application/json" } }
          );

          const { accessToken, refreshToken } = normalizeBackendAuth(resp.data);
          if (resp.status >= 200 && resp.status < 300 && accessToken) {
            return buildUserAuthPayload({
              id: credentials.email,
              email: credentials.email,
              name: credentials.email,
              accessToken,
              refreshToken,
            });
          }
          return null;
        } catch (err: any) {
          // Mantém a superfície estável; erros internos não vazam detalhes
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
    /** JWT: agrega tokens do usuário (credentials ou google) */
    async jwt({ token, user, account, profile }) {
      // Login via credentials → user já vem com tokens normalizados
      if (user && (user as any).accessToken) {
        token.id = (user as any).id ?? token.id ?? (user as any).email ?? "";
        token.email = (user as any).email ?? token.email ?? null;
        token.name = (user as any).name ?? token.name ?? null;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        return token;
      }

      // Login via Google → trocar ID token por tokens do backend (se habilitado)
      if (account?.provider === "google" && account.id_token) {
        try {
          const { accessToken, refreshToken } =
            await exchangeGoogleIdTokenForAppTokens(account.id_token);

          token.accessToken = accessToken;
          token.refreshToken = refreshToken ?? null;
          token.id = (profile as any)?.email ?? token.id ?? "";
          token.email = (profile as any)?.email ?? token.email ?? null;
          token.name = (profile as any)?.name ?? token.name ?? null;
        } catch {
          // Falha na troca → mantém token vazio para bloquear acesso protegido
          return {};
        }
      }

      return token;
    },

    /** Session: garante shape estável e não quebra tipos */
    async session({ session, token }) {
      const id = (token.id ?? token.email ?? "") as string;
      const email = (token.email ?? session.user?.email ?? null) as
        | string
        | null;
      const name = (token.name ?? session.user?.name ?? null) as
        | string
        | null;

      const image =
        (session.user && typeof session.user === "object" && "image" in session.user
          ? (session.user as any).image
          : null) ?? null;

      session.user = {
        ...(session.user ?? {}),
        id,
        email,
        name,
        image, // preserva imagem se houver
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

export default NextAuth(authOptions);
