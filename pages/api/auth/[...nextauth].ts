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

/*

import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

// Define a type for the user object
interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  // Add other properties as needed
}

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const response = await axios.post('https://apilogin-m87n.onrender.com/auth/authenticate', {
            email: credentials?.email,
            password: credentials?.password,
          }, {
            headers: { 'Content-Type': 'application/json' },
          });
      
          const data = response.data;
      
          if (response.status === 200 && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
            };
          }
        } catch (error) {
          console.error('Error during authentication:', error);
        }
        
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login', // Página de login personalizada
    // Pode personalizar outras páginas aqui
  },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token, user, account, profile }): Promise<JWT> {
      // When the user logs in for the first time, add profile information
      if (account && profile) {
        token.sub = profile.sub; // Taking the sub from the Google profile
      }

      // If it's a credentials login, merge user properties with the token
      if (user) {
        const authenticatedUser = user as User;
        token.id = authenticatedUser.id;
        token.email = authenticatedUser.email;
        token.name = authenticatedUser.name;
        console.log('JWT token after credentials login:', token); // Log the token after credentials login
        return { ...token, id: authenticatedUser.id, email: authenticatedUser.email, name: authenticatedUser.name };
      }

      return token;
    },
    async session({ session, token }): Promise<Session> {
      // Ensure id is a string before assigning it to session.user.id
      const userId = token.id ?? token.sub;
      if (!userId) {
        console.error('UserId is missing in token');
      }
      session.user = {
        ...session.user,
        id: userId ? String(userId) : '',
        email: token.email || session.user.email || '', // Ensure email is also set
        name: token.name || session.user.name || '',
      };
      if (!session.user.id || !session.user.email) {
        console.error('UserId or email is missing in session.user', session.user);
      } else {
        console.log('Session user:', session.user); // Log the session user
      }
      return session;
    },
  },
};

export default NextAuth(options);

*/