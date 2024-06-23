// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function authorize(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow requests if one of the following is true...
  // 1. It's a request for next-auth session or provider fetching
  // 2. The token exists
  if (pathname.includes('/api/auth') || token) {
    return NextResponse.next();
  }

  // Redirect to login if the user doesn't have a token and is requesting a protected route
  if (!token && pathname.startsWith('/protected/')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If it doesn't fit any of the above conditions, redirect to the login page
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = {
  // Declare protected routes
  matcher: ['/protected/:path*'],
};

export default authorize;
