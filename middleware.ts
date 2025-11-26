import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isOriginAllowed } from '@/lib/config/cors';

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // ✅ Gestion CORS pour les routes API
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    
    if (origin && !isOriginAllowed(origin)) {
      return new NextResponse(null, { 
        status: 403,
        statusText: 'Origine non autorisée'
      });
    }
    
    const response = NextResponse.next();
    
    if (origin && isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      );
    }
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: origin && isOriginAllowed(origin) ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT',
          'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          'Access-Control-Max-Age': '86400',
        } : {}
      });
    }
    
    return response;
  }

  // Routes publiques
  const publicRoutes = ['/', '/auth/login', '/auth/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // ✅ Vérification de l'authentification via cookies httpOnly
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userRole = cookieStore.get('user_role')?.value;
  const userStatus = cookieStore.get('user_status')?.value;

  const isLoggedIn = !!accessToken && !!userRole;

  // Redirection si connecté et accès à /auth
  if (isLoggedIn && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Redirection si non connecté et accès à route protégée
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl));
  }

  // Vérification des permissions selon le rôle
  if (isLoggedIn && userRole) {
    // Routes réservées aux admins et super admins
    const adminRoutes = ['/utilisateurs', '/rapports', '/configurations',  '/elections'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute && !['ADMIN', 'SADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // Vérifier si le compte est actif
    if (userStatus === 'inactive') {
      return NextResponse.redirect(new URL('/auth/login?error=account_inactive', nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};

