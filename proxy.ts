import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Front-door auth gate.
 *
 * No valid session → bounce to /login. A caller session is scoped to /contacts
 * (and its sub-routes); anything else redirects them back there. An admin
 * session reaches everything. The matcher below already excludes /login, the
 * API, and static assets, so this only runs on app pages.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (session.role === "caller") {
    const inScope = pathname === "/contacts" || pathname.startsWith("/contacts/");
    if (!inScope) {
      const url = request.nextUrl.clone();
      url.pathname = "/contacts";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on every app page except:
     * - login (the gate's own escape hatch)
     * - api (bearer-guarded separately)
     * - _next/static, _next/image (build assets)
     * - favicon / icon / manifest / static image files
     */
    "/((?!login|api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
