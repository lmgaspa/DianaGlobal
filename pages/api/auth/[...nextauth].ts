import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

interface JWT {
  id?: string;
  email?: string;
  name?: string;
  sub?: string;
  [key: string]: any;
}

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
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
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
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
        token.name = user.name;
      }

      return token as JWT;
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
