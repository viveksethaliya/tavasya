import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  if (userAgent.toLowerCase().includes('meta-externalagent')) {
    return new NextResponse(null, { status: 403 });
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
