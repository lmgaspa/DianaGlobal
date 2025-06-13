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
    throw new Error('Missing credentials');
  }

  try {
    const response = await axios.post(
      'https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/login',
      {
        email: credentials.email,
        password: credentials.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;

    if (response.status === 200 && data.token) {
      return {
        id: credentials.email, // já que o backend não retorna ID explícito
        email: credentials.email,
        name: credentials.email, // ou null, se preferir
        accessToken: data.token,
        refreshToken: data.refreshToken,
      };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('Erro ao autenticar:', error?.response?.data || error.message);
    throw new Error('Failed to authenticate');
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
    async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.name = user.name ?? undefined;
    token.accessToken = user.accessToken;
    token.refreshToken = user.refreshToken;
  }
  return token;
},
    async session({ session, token }) {
  session.user = {
    ...session.user,
    id: token.id,
    email: token.email,
    name: token.name,
  };
  (session as any).accessToken = token.accessToken;
  (session as any).refreshToken = token.refreshToken;
  return session;
},
  },
};

export default NextAuth(options);
