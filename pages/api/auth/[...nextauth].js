// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
              email: { label: 'Email', type: 'text' },
              password: { label: 'Password', type: 'password' },
          },
          authorize: async (credentials) => {
              const res = await fetch('https://apilogin-mvf1.onrender.com/auth/authenticate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(credentials),
              });
              const user = await res.json();

              if (res.ok && user) {
                  return user;
              }
              return null;
          },
      }),
      GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
      ],
      callbacks: {
          async jwt({ token, user }) {
            if (user) {
              return { ...token, ...user.user }; // Mesclando as propriedades do token com as do usuário
            }
            return token;
          },
          async session({ session, token }) {
            if (token?.id) {
              session.user = { id: token.id };
            } else if (token?.sub) {
              session.user = { id: token.sub };
            }
            return session;
          }
        },
  pages: {
      signIn: '/login',
  },
});