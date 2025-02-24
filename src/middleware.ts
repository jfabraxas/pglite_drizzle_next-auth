import { NextResponse } from 'next/server';
//import { auth } from '@/auth';

/*
export default auth((req) => {
  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile'];

  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }
  }

  return NextResponse.next();
});
*/

export default async function middleware(){
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/api/auth/:path*'],
};
