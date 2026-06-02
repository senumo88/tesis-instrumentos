import { prisma } from "../../lib/prisma"
import InterviewsClient from "./InterviewsClient"

export default async function InterviewsPage() {
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

  return <InterviewsClient initialInterviews={interviews} />
}