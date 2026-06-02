import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { interviewQuestions } from "../../../lib/constants/interview-questions"

type CreateInterviewBody = {
  code?: string
  area?: string
  position?: string
  interviewee?: string
  durationMinutes?: number
  generalNotes?: string
}

export async function GET() {
  const interviews = await prisma.interview.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      answers: {
        orderBy: {
          questionNumber: "asc",
        },
      },
    },
  })

  return NextResponse.json(interviews)
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateInterviewBody

  const interview = await prisma.interview.create({
    data: {
      code: body.code,
      area: body.area,
      position: body.position,
      interviewee: body.interviewee,
      durationMinutes: body.durationMinutes,
      generalNotes: body.generalNotes,
      answers: {
        create: interviewQuestions.map((item) => ({
          questionNumber: item.questionNumber,
          category: item.category,
          objective: item.objective,
          question: item.question,
          answer: "",
          finding: "",
          evidence: "",
        })),
      },
    },
    include: {
      answers: {
        orderBy: {
          questionNumber: "asc",
        },
      },
    },
  })

  return NextResponse.json(interview)
}