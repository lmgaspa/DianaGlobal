import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname, origin } = req.nextUrl;

    // Capturar IP e URL
    const ip = req.headers.get('x-forwarded-for') || req.ip || '0.0.0.0';
    const url = pathname;

    // Enviar os dados de acesso para o Elasticsearch
    await axios.post('http://localhost:9200/access_logs/_doc', {
        ip,
        url,
        timestamp: new Date()
    }).catch(err => console.error('Erro ao enviar para Elasticsearch:', err));

    // Redirecionar usuários não autenticados tentando acessar rotas protegidas
    if (!token && pathname.startsWith('/protected/')) {
        return NextResponse.redirect(`${origin}/login`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/protected/:path*'],
};
