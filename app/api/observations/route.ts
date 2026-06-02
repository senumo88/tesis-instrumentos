import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

type ObservationActivityInput = {
  previousActivity?: string
  currentActivity?: string
  nextActivity?: string
  responsible?: string
  document?: string
  tool?: string
  timeSpent?: number
  waitingTime?: number
  error?: string
  cause?: string
  reprocess?: boolean
  duplicated?: boolean
  noValue?: boolean
  delayType?: string
  automationOpportunity?: string
  notes?: string
}

type CreateObservationBody = {
  code?: string
  date?: string
  area?: string
  responsible?: string
  startTime?: string
  endTime?: string
  generalResult?: string
  activities?: ObservationActivityInput[]
}

export async function GET() {
  const observations = await prisma.observation.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      activities: true,
    },
  })

  return NextResponse.json(observations)
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateObservationBody

  const observation = await prisma.observation.create({
  data: {
    code: body.code,
    date: body.date ? new Date(body.date) : undefined,
    area: body.area,
    responsible: body.responsible,
    startTime: body.startTime,
    endTime: body.endTime,
    generalResult: body.generalResult,
    activities: {
      create: body.activities?.map((activity) => ({
        previousActivity: activity.previousActivity,
        currentActivity: activity.currentActivity,
        nextActivity: activity.nextActivity,
        responsible: activity.responsible,
        document: activity.document,
        tool: activity.tool,
        timeSpent: activity.timeSpent,
        waitingTime: activity.waitingTime,
        error: activity.error,
        cause: activity.cause,
        reprocess: activity.reprocess ?? false,
        duplicated: activity.duplicated ?? false,
        noValue: activity.noValue ?? false,
        delayType: activity.delayType,
        automationOpportunity: activity.automationOpportunity,
        notes: activity.notes,
      })),
    },
  },
  include: {
    activities: true,
  },
})

  return NextResponse.json(observation)
}