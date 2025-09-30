import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** ==== Helpers (OCP) ==== */
function isProtectedPath(pathname: string) {
  return pathname.startsWith("/protected/");
}

function hasCustomJwt(req: NextRequest) {
  return Boolean(req.cookies.get("access_token")?.value);
}

function logAccessIfEnabled(req: NextRequest) {
  const elasticUrl = process.env.ELASTIC_URL; // ex: https://seu-elastic/_doc?pipeline=geoip_pipeline
  const elasticUser = process.env.ELASTIC_USER;
  const elasticPass = process.env.ELASTIC_PASS;
  if (!elasticUrl || !elasticUser || !elasticPass) return;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const url = req.nextUrl.pathname;
  const auth = Buffer.from(`${elasticUser}:${elasticPass}`).toString("base64");

  // fire-and-forget: não aguarda
  fetch(elasticUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ ip, url, timestamp: new Date().toISOString() }),
  }).catch(() => void 0);
}
/** ======================= */

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1) Logging opcional (não bloqueante)
  logAccessIfEnabled(req);

  // 2) Autorização: aceita sessão NextAuth OU cookie próprio 'access_token'
  const nextAuthToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (isProtectedPath(pathname) && !nextAuthToken && !hasCustomJwt(req)) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"],
};
