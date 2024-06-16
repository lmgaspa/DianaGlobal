// middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function authorize(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Permitir as solicitações se uma das seguintes condições for verdadeira...
  // 1. É uma solicitação para obter uma sessão ou provedor do next-auth
  // 2. O token existe
  if (pathname.includes('/api/auth') || token) {
    return NextResponse.next();
  }

  // Redirecionar para login se o usuário não tiver um token E estiver solicitando uma rota protegida
  if (!token && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Se o usuário tentar acessar uma rota privada sem um token, redirecione-o para a página de login
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = {
  // Declare as rotas protegidas
  matcher: ['/protected/:path*',],
};

export default authorize;
