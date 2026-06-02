import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

type UpdateAnswerBody = {
  answer?: string
  finding?: string
  evidence?: string
}

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params
  const body = (await request.json()) as UpdateAnswerBody

  const updatedAnswer = await prisma.interviewAnswer.update({
    where: {
      id,
    },
    data: {
      answer: body.answer,
      finding: body.finding,
      evidence: body.evidence,
    },
  })

  return NextResponse.json(updatedAnswer)
}