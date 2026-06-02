import { Prisma } from "@prisma/client"
import { prisma } from "../../lib/prisma"
import DocumentsClient from "./DocumentsClient"

type DocumentAnalysisWithRecords = Prisma.DocumentAnalysisGetPayload<{
  include: {
    records: true
  }
}>

export default async function DocumentsPage() {
  const analyses: DocumentAnalysisWithRecords[] =
    await prisma.documentAnalysis.findMany({
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
  }))

  return <DocumentsClient initialAnalyses={formattedAnalyses} />
}