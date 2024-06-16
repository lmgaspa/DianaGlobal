import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Configuração do cookie de sessão com SameSite=Strict
  res.setHeader(
    'Set-Cookie',
    `next-auth.session-token=${session.accessToken}; Path=/; HttpOnly; SameSite=Strict; Secure`
  );

  res.status(200).json({ user: session.user });
}
