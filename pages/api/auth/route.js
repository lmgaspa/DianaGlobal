import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

const options = {
  providers: [
    Providers.Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Example logic to authenticate with credentials
        const response = await fetch('https://your-api-endpoint/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });

        if (response.ok) {
          const user = await response.json();
          return Promise.resolve(user);
        } else {
          const error = await response.text();
          throw new Error(error || 'Failed to authenticate');
        }
      }
    }),
    // Add other authentication providers here if needed, like GoogleProvider, etc.
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/auth/error',
    verifyRequest: '/signup',
    newUser: null // If null, a link will be sent to the email after registration
  },
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session(session, token) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    }
  }
};

const authRoute = (req, res) => NextAuth(req, res, options);

export default authRoute;