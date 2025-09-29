// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // ajuste se quiser um tempo de sessão diferente:
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing credentials");
        }

        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          }),
        });

        // 401 = credenciais inválidas
        if (res.status === 401) return null;

        // 403 = e-mail não confirmado (propaga erro compreensível à UI)
        if (res.status === 403) {
          // tenta extrair mensagem do backend
          let msg = "Please confirm your e-mail to sign in.";
          try {
            const j = await res.json();
            msg = j?.message || j?.detail || msg;
          } catch {}
          throw new Error(msg);
        }

        if (!res.ok) {
          let msg = `Login failed (${res.status})`;
          try {
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
              const j = await res.json();
              msg = j?.message || j?.detail || msg;
            } else {
              msg = (await res.text()) || msg;
            }
          } catch {}
          throw new Error(msg);
        }

        // sucesso 2xx
        let data: any = {};
        try {
          data = await res.json();
        } catch {
          // se o backend algum dia devolver texto, falhará aqui — melhor errar cedo
          throw new Error("Unexpected response from server");
        }

        // normalize field names from backend
        const accessToken =
          data?.jwt || data?.token || data?.accessToken || null;
        const refreshToken = data?.refreshToken || data?.refresh_token || null;

        if (!accessToken) {
          throw new Error("Missing access token in response");
        }

        // NextAuth requer um objeto "user"
        return {
          id: data?.userId || credentials.email, // fallback em e-mail
          email: credentials.email,
          name: data?.name ?? credentials.email.split("@")[0],
          accessToken,
          refreshToken,
        } as any;
      },
    }),

    // ⚠️ Google OAuth só use se você realmente tratar no backend ou aceitar login social.
    // Pode manter habilitado; a sessão será do NextAuth (sem chamar seu /api/auth/login).
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      // primeira vez no login (user vem do authorize)
      if (user) {
        token.id = (user as any).id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      // expõe os campos no session para a UI
      session.user = {
        ...session.user,
        id: (token as any).id as string,
        email: token.email as string,
        name: token.name as string | undefined,
      };
      (session as any).accessToken = (token as any).accessToken;
      (session as any).refreshToken = (token as any).refreshToken ?? null;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // após login, manda para o dashboard protegido
      // se "url" for interna, usa; do contrário, força dashboard
      try {
        const isInternal =
          url.startsWith(baseUrl) ||
          (url.startsWith("/") && !url.startsWith("//"));
        if (isInternal) return url;
      } catch {}
      return `${baseUrl}/protected/dashboard`;
    },
  },
};

export default NextAuth(authOptions);
