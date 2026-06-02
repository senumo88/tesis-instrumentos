import { prisma } from "../../lib/prisma"
import ObservationsClient from "./ObservationsClient"

type ObservationActivityFromDb = {
  id: string
  observationId: string
  previousActivity: string | null
  currentActivity: string | null
  nextActivity: string | null
  responsible: string | null
  document: string | null
  tool: string | null
  timeSpent: number | null
  waitingTime: number | null
  error: string | null
  cause: string | null
  reprocess: boolean
  duplicated: boolean
  noValue: boolean
  delayType: string | null
  automationOpportunity: string | null
  notes: string | null
}

type ObservationFromDb = {
  id: string
  code: string | null
  date: Date | null
  area: string | null
  responsible: string | null
  startTime: string | null
  endTime: string | null
  generalResult: string | null
  createdAt: Date
  activities: ObservationActivityFromDb[]
}

export default async function ObservationsPage() {
  const observations: ObservationFromDb[] = await prisma.observation.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      activities: true,
    },
  })

  const formattedObservations = observations.map(
    (observation: ObservationFromDb) => ({
      ...observation,
      date: observation.date ? observation.date.toISOString() : null,
    })
  )

  return <ObservationsClient initialObservations={formattedObservations} />
}