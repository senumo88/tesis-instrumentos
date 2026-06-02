import { jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/api/login", "/favicon.ico"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath =
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next")

  if (isPublicPath) {
    return NextResponse.next()
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const token = request.cookies.get("tesis_session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("tesis_session")
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}