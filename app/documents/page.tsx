import { prisma } from "../../lib/prisma"
import DocumentsClient from "./DocumentsClient"

type DocumentRecordFromDb = {
  id: string
  analysisId: string
  documentName: string | null
  documentType: string | null
  processStage: string | null
  areaResponsible: string | null
  purpose: string | null
  mediumUsed: string | null
  detectedError: string | null
  probableCause: string | null
  errorImpact: string | null
  validationType: string | null
  validationsRequired: number | null
  reprocess: boolean
  duplicated: boolean
  repetitiveValidation: boolean
  delayDetected: boolean
  excessiveExcelEmailUse: boolean
  documentValue: string | null
  automatable: boolean
  technologicalRequirement: string | null
  digitalizationOpportunity: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

type DocumentAnalysisFromDb = {
  id: string
  code: string | null
  date: Date | null
  area: string | null
  responsible: string | null
  generalResult: string | null
  createdAt: Date
  updatedAt: Date
  records: DocumentRecordFromDb[]
}

export default async function DocumentsPage() {
  const analyses: DocumentAnalysisFromDb[] =
    await prisma.documentAnalysis.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        records: true,
      },
    })

  const formattedAnalyses = analyses.map((analysis: DocumentAnalysisFromDb) => ({
    ...analysis,
    date: analysis.date ? analysis.date.toISOString() : null,
    records: analysis.records,
  }))

  return <DocumentsClient initialAnalyses={formattedAnalyses} />
}