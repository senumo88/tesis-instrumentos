import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

type DocumentRecordInput = {
  documentName?: string
  documentType?: string
  processStage?: string
  areaResponsible?: string
  purpose?: string
  mediumUsed?: string
  detectedError?: string
  probableCause?: string
  errorImpact?: string
  validationType?: string
  validationsRequired?: number
  reprocess?: boolean
  duplicated?: boolean
  repetitiveValidation?: boolean
  delayDetected?: boolean
  excessiveExcelEmailUse?: boolean
  documentValue?: string
  automatable?: boolean
  technologicalRequirement?: string
  digitalizationOpportunity?: string
  notes?: string
}

type CreateDocumentAnalysisBody = {
  code?: string
  date?: string
  area?: string
  responsible?: string
  generalResult?: string
  records?: DocumentRecordInput[]
}

export async function GET() {
  const analyses = await prisma.documentAnalysis.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      records: true,
    },
  })

  return NextResponse.json(analyses)
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateDocumentAnalysisBody

  const analysis = await prisma.documentAnalysis.create({
    data: {
      code: body.code,
      date: body.date ? new Date(body.date) : undefined,
      area: body.area,
      responsible: body.responsible,
      generalResult: body.generalResult,
      records: {
        create: body.records?.map((record) => ({
          documentName: record.documentName,
          documentType: record.documentType,
          processStage: record.processStage,
          areaResponsible: record.areaResponsible,
          purpose: record.purpose,
          mediumUsed: record.mediumUsed,
          detectedError: record.detectedError,
          probableCause: record.probableCause,
          errorImpact: record.errorImpact,
          validationType: record.validationType,
          validationsRequired: record.validationsRequired,
          reprocess: record.reprocess ?? false,
          duplicated: record.duplicated ?? false,
          repetitiveValidation: record.repetitiveValidation ?? false,
          delayDetected: record.delayDetected ?? false,
          excessiveExcelEmailUse: record.excessiveExcelEmailUse ?? false,
          documentValue: record.documentValue,
          automatable: record.automatable ?? false,
          technologicalRequirement: record.technologicalRequirement,
          digitalizationOpportunity: record.digitalizationOpportunity,
          notes: record.notes,
        })),
      },
    },
    include: {
      records: true,
    },
  })

  return NextResponse.json(analysis)
}