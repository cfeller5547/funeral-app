import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        const publicRoutes = ['/login', '/signup', '/forgot-password', '/request-demo']
        const portalRoute = /^\/f\/[^/]+/

        if (publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
          return true
        }

        // Allow portal routes (they have their own token-based auth)
        if (portalRoute.test(req.nextUrl.pathname)) {
          return true
        }

        // Require auth for app routes
        if (req.nextUrl.pathname.startsWith('/app')) {
          return !!token
        }

        // Allow other routes
        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    // Match all routes except static files and api
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
