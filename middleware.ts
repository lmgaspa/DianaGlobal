import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function authorize(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname, origin } = req.nextUrl;

  if (pathname.startsWith('/api/auth/') || token) {
    return NextResponse.next();
  }

  if (!token && pathname.startsWith('/protected/')) {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (!token && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};

export default authorize;
