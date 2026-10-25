import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = req.nextUrl.pathname.startsWith("/admin")
    const isAccount = req.nextUrl.pathname.startsWith("/account")

    // Check admin access
    if (isAdmin) {
      const roles = (token as any)?.roles || []
      const hasAdminRole = roles.some(
        (role: any) => role.name === "ADMIN" || role.name === "SUPER_ADMIN"
      )

      if (!hasAdminRole) {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // Check account access
    if (isAccount && !token) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
  ],
}
