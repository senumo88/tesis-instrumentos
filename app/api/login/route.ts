import { NextResponse } from "next/server"
import { createSessionToken } from "../../../lib/auth"

type LoginBody = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody

  const validEmail = process.env.APP_LOGIN_EMAIL
  const validPassword = process.env.APP_LOGIN_PASSWORD

  if (body.email !== validEmail || body.password !== validPassword) {
    return NextResponse.json(
      { message: "Credenciales incorrectas" },
      { status: 401 }
    )
  }

  const token = await createSessionToken()

  const response = NextResponse.json({ ok: true })

  response.cookies.set("tesis_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}