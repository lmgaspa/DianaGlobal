// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const response = await axios.post('https://apilogin-mvf1.onrender.com/auth/authenticate', {
            email: credentials.email,
            password: credentials.password,
          }, {
            headers: { 'Content-Type': 'application/json' },
          });

          const user = response.data;

          if (response.status === 200 && user) {
            return user;
          }
        } catch (error) {
          console.error('Erro durante a autenticação:', error);
          return null;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.SECRET,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Quando o usuário faz login pela primeira vez, adicione informações do perfil
      if (account && profile) {
        token.sub = profile.sub; // Pegando o sub do perfil Google
      }

      // Se for um login usando credenciais, mescle as propriedades do usuário com o token
      if (user) {
        return { ...token, ...user.user };
      }

      return token;
    },
    async session({ session, token }) {
      // Incluindo o sub na sessão
      session.user = {
        ...session.user,
        id: token.id || token.sub, // Priorize o ID do token ou o sub
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
