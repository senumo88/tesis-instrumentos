import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const interviews = await prisma.interview.findMany()

  return NextResponse.json({
    ok: true,
    data: interviews
  })

}