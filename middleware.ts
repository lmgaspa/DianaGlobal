import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1) Coleta IP/URL para logging (não bloqueante e só se tiver URL configurada)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
  const url = req.nextUrl.pathname;

  const elasticUrl = process.env.ELASTIC_URL; // ex: https://seu-elastic/_doc?pipeline=geoip_pipeline
  const elasticUser = process.env.ELASTIC_USER;
  const elasticPass = process.env.ELASTIC_PASS;

  if (elasticUrl && elasticUser && elasticPass) {
    // fire-and-forget; não usa await para não travar a navegação
    const auth = Buffer.from(`${elasticUser}:${elasticPass}`).toString('base64');
    fetch(elasticUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ ip, url, timestamp: new Date().toISOString() }),
    }).catch(() => {/* ignore errors */});
  }

  // 2) Autorização: aceita next-auth OU seu cookie 'access_token'
  const nextAuthToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const customJwt = req.cookies.get('access_token')?.value;

  const isProtected = pathname.startsWith('/protected/');

  if (isProtected && !nextAuthToken && !customJwt) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};
