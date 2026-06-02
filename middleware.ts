import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "./lib/auth"

const publicPaths = ["/login", "/api/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("tesis_session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const isValid = await verifySessionToken(token)

  if (!isValid) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}