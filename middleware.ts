import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function authorize(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname, origin } = req.nextUrl; // Extrai o caminho e a origem da URL da requisição

  // Permite a requisição se uma das condições abaixo for verdadeira...
  // 1. É uma requisição para autenticação ou busca de provedor pelo next-auth
  // 2. O token existe e é válido
  if (pathname.startsWith('/api/auth/') || token) {
    return NextResponse.next(); // Permite que a requisição continue para o próximo middleware ou rota
  }

  // Redireciona para a página de login se o usuário não tiver um token e estiver acessando uma rota protegida
  if (!token && pathname.startsWith('/protected/')) {
    return NextResponse.redirect(`${origin}/login`); // Redireciona para a página de login com URL absoluta
  }

  // Para rotas que não são de API e requerem autenticação, redireciona para a página de login
  if (!token && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(`${origin}/login`); // Redireciona para a página de login com URL absoluta
  }

  // Se não se encaixar em nenhuma das condições acima, permite que a requisição continue
  return NextResponse.next();
}

export const config = {
  // Declara as rotas protegidas que serão interceptadas por este middleware
  matcher: ['/protected/:path*'],
};

export default authorize;
