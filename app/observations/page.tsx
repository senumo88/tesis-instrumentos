import { prisma } from "../../lib/prisma"
import ObservationsClient from "./ObservationsClient"

export default async function ObservationsPage() {
  const observations = await prisma.observation.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      activities: true,
    },
  })

  const formattedObservations = observations.map((observation) => ({
    ...observation,
    date: observation.date ? observation.date.toISOString() : null,
  }))

  return <ObservationsClient initialObservations={formattedObservations} />
}