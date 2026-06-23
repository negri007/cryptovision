import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/market') || 
    pathname.startsWith('/analysis') || 
    pathname.startsWith('/portfolio') || 
    pathname.startsWith('/planning') || 
    pathname.startsWith('/alerts') || 
    pathname.startsWith('/profile');

  const isAdminPath = pathname.startsWith('/admin');

  if (isProtectedPath || isAdminPath) {
    // Note: To properly verify Firebase tokens in Edge proxy, you would normally
    // use a session cookie created via Firebase Admin on login, since verifyIdToken 
    // requires Node.js runtime. We do a basic check here.
    const token = request.cookies.get('session')?.value || request.headers.get('Authorization');
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Add basic Rate Limiting headers or logic here if needed

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
};
