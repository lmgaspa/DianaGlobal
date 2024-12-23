import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname, origin } = req.nextUrl;

    // Capturar IP e URL
    const ip = req.headers.get('x-forwarded-for') || req.ip || '0.0.0.0'; // Captura o IP do visitante
  const url = req.nextUrl.pathname; // Captura a URL acessada

  try {
    // Enviar os dados para o Elasticsearch
    await axios.post('http://localhost:9200/access_logs/_doc?pipeline=geoip_pipeline', {
      ip,
      url,
      timestamp: new Date().toISOString(), // Adiciona o timestamp atual
    });
    console.log('Dados enviados com sucesso para o Elasticsearch.');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao enviar para o Elasticsearch:', error.message);
    } else {
      console.error('Erro ao enviar para o Elasticsearch:', error);
    }
  }


    // Redirecionar usuários não autenticados tentando acessar rotas protegidas
    if (!token && pathname.startsWith('/protected/')) {
        return NextResponse.redirect(`${origin}/login`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/protected/:path*'],
};
