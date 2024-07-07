import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

// Importe o tipo JWT como um tipo genérico
type JWT = {
  [key: string]: any; // Ou ajuste conforme a estrutura do seu token JWT
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
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Verifique se as credenciais são definidas antes de prosseguir
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error('Missing credentials');
        }

        try {
          const response = await axios.post('https://apilogin-m87n.onrender.com/auth/authenticate', {
            email: credentials.email,
            password: credentials.password,
          });

          const data = response.data;

          if (response.status === 200 && data.user) {
            // Certifique-se de que está retornando o campo correto para name
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name !== data.user.email ? data.user.name : null, // Adicione verificação
            };
          } else {
            throw new Error('Failed to authenticate');
          }
        } catch (error) {
          console.error('Error during authentication:', error);
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
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token, user, account, profile }): Promise<JWT> {
      if (account?.provider === 'google' && profile?.sub) {
        token.sub = profile.sub;
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name || user.email; // Adicione fallback
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
