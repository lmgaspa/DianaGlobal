import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Helpers */
const isProtectedPath = (p: string) => p.startsWith("/protected/");
const hasCustomJwt = (req: NextRequest) => Boolean(req.cookies.get("access_token")?.value);

function logAccessIfEnabled(req: NextRequest) {
  const elasticUrl = process.env.ELASTIC_URL;
  const elasticUser = process.env.ELASTIC_USER;
  const elasticPass = process.env.ELASTIC_PASS;
  if (!elasticUrl || !elasticUser || !elasticPass) return;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const url = req.nextUrl.pathname;
  const auth = Buffer.from(`${elasticUser}:${elasticPass}`).toString("base64");

  fetch(elasticUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ ip, url, timestamp: new Date().toISOString() }),
  }).catch(() => void 0);
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  logAccessIfEnabled(req);

  // ⚠️ Agora exigimos JWT do backend: no cookie OU dentro do token do NextAuth.
  const nextAuth = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const nextAuthBackendJwt = (nextAuth as any)?.accessToken as string | undefined;

  if (isProtectedPath(pathname) && !hasCustomJwt(req) && !nextAuthBackendJwt) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/protected/:path*"] };
