import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const wpScanPatterns = [
  /^\/wp-admin/i,
  /^\/wp-login\.php/i,
  /^\/xmlrpc\.php/i,
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\d{4}\/\d{2}\/\d{2}\// // /YYYY/MM/DD/
];

const blockedUserAgents = ['meta-externalagent', 'meta-webindexer'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host');
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // 1. Kill scan/attack traffic FIRST — cheapest possible response, no redirect hop
  if (wpScanPatterns.some(pattern => pattern.test(pathname))) {
    return new NextResponse(null, { status: 404 });
  }

  // 2. Kill blocked bots FIRST — same reasoning, don't let them consume a redirect hop
  if (blockedUserAgents.some(ua => userAgent.includes(ua))) {
    return new NextResponse(null, { status: 403 });
  }

  // 3. THEN canonicalize domain for everything that survived the checks above
  if (host === 'tavasyamachines.com') {
    return NextResponse.redirect(`https://www.tavasyamachines.com${pathname}${search}`, { status: 301 });
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // We don't want to run on all paths, just paths we care about protecting
  // However since we need to block at the edge we match everything EXCEPT 
  // standard static assets to keep costs down
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
