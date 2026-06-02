import { prisma } from "../../lib/prisma"
import DocumentsClient from "./DocumentsClient"

export default async function DocumentsPage() {
  const analyses = await prisma.documentAnalysis.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      records: true,
    },
  })

  const formattedAnalyses = analyses.map((analysis) => ({
    ...analysis,
    date: analysis.date ? analysis.date.toISOString() : null,
    records: analysis.records,
  }))

  return <DocumentsClient initialAnalyses={formattedAnalyses} />
}