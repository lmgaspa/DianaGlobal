  // pages/api/auth/[...nextauth].js
  import NextAuth from 'next-auth';
  import CredentialsProvider from 'next-auth/providers/credentials';
  import GoogleProvider from 'next-auth/providers/google';

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
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],secret: process.env.NEXTAUTH_SECRET,
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
    secret: process.env.SECRET,
    pages: {
      signIn: '/login',
    },
  });
