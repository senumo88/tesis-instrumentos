import { prisma } from "../../lib/prisma"

type TriangulationRow = {
  finding: string
  interview: boolean
  observation: boolean
  documentAnalysis: boolean
  coincidence: "Alta" | "Media" | "Baja" | "Sin evidencia"
  interpretation: string
}

type InterviewAnswerFromDb = {
  id: string
  finding: string | null
}

type InterviewFromDb = {
  id: string
  answers: InterviewAnswerFromDb[]
}

type ObservationActivityFromDb = {
  id: string
  delayType: string | null
  waitingTime: number | null
  reprocess: boolean
  tool: string | null
  cause: string | null
  error: string | null
}

type ObservationFromDb = {
  id: string
  activities: ObservationActivityFromDb[]
}

type DocumentRecordFromDb = {
  id: string
  delayDetected: boolean
  errorImpact: string | null
  reprocess: boolean
  mediumUsed: string | null
  excessiveExcelEmailUse: boolean
  validationType: string | null
  detectedError: string | null
  probableCause: string | null
}

type DocumentAnalysisFromDb = {
  id: string
  records: DocumentRecordFromDb[]
}

const findings = [
  {
    name: "Demoras documentarias",
    interpretation:
      "Identificar posibles causas relacionadas con validaciones, tiempos de espera o dependencia manual.",
  },
  {
    name: "Reprocesos",
    interpretation:
      "Analizar el impacto de correcciones reiteradas o duplicidad de actividades en el flujo documentario.",
  },
  {
    name: "Uso excesivo de Excel",
    interpretation:
      "Evaluar la necesidad de integración tecnológica o implementación de un sistema centralizado.",
  },
  {
    name: "Validaciones manuales",
    interpretation:
      "Determinar oportunidades de automatización y reducción de tareas manuales.",
  },
  {
    name: "Falta de estandarización",
    interpretation:
      "Evaluar la necesidad de formatos únicos, procedimientos definidos o mecanismos de control documental.",
  },
  {
    name: "Errores documentarios",
    interpretation:
      "Identificar controles, validaciones o mejoras necesarias para reducir inconsistencias documentarias.",
  },
]

function getCoincidence(count: number): TriangulationRow["coincidence"] {
  if (count === 3) return "Alta"
  if (count === 2) return "Media"
  if (count === 1) return "Baja"
  return "Sin evidencia"
}

function YesNoBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-bold ${
        value
          ? "bg-emerald-100 text-emerald-800"
          : "bg-rose-100 text-rose-700"
      }`}
    >
      {value ? "Sí" : "No"}
    </span>
  )
}

export default async function TriangulationPage() {
  const interviews: InterviewFromDb[] = await prisma.interview.findMany({
    include: {
      answers: true,
    },
  })

  const observations: ObservationFromDb[] = await prisma.observation.findMany({
    include: {
      activities: true,
    },
  })

  const analyses: DocumentAnalysisFromDb[] =
    await prisma.documentAnalysis.findMany({
      include: {
        records: true,
      },
    })

  const rows: TriangulationRow[] = findings.map((finding) => {
    const interview = interviews.some((interviewItem: InterviewFromDb) =>
      interviewItem.answers.some(
        (answer: InterviewAnswerFromDb) => answer.finding === finding.name
      )
    )

    const observation = observations.some((observationItem: ObservationFromDb) =>
      observationItem.activities.some((activity: ObservationActivityFromDb) => {
        if (finding.name === "Demoras documentarias") {
          return Boolean(activity.delayType || activity.waitingTime)
        }

        if (finding.name === "Reprocesos") {
          return activity.reprocess
        }

        if (finding.name === "Uso excesivo de Excel") {
          return activity.tool === "Excel"
        }

        if (finding.name === "Validaciones manuales") {
          return activity.tool === "Validación manual"
        }

        if (finding.name === "Falta de estandarización") {
          return activity.cause === "Ausencia de formato estándar"
        }

        if (finding.name === "Errores documentarios") {
          return Boolean(activity.error)
        }

        return false
      })
    )

    const documentAnalysis = analyses.some((analysisItem: DocumentAnalysisFromDb) =>
      analysisItem.records.some((record: DocumentRecordFromDb) => {
        if (finding.name === "Demoras documentarias") {
          return (
            record.delayDetected ||
            record.errorImpact === "Demora en aprobación"
          )
        }

        if (finding.name === "Reprocesos") {
          return record.reprocess
        }

        if (finding.name === "Uso excesivo de Excel") {
          return record.mediumUsed === "Excel" || record.excessiveExcelEmailUse
        }

        if (finding.name === "Validaciones manuales") {
          return record.validationType === "Revisión manual"
        }

        if (finding.name === "Falta de estandarización") {
          return (
            record.detectedError === "Falta de estandarización" ||
            record.probableCause === "Ausencia de formato estándar"
          )
        }

        if (finding.name === "Errores documentarios") {
          return Boolean(record.detectedError)
        }

        return false
      })
    )

    const count = [interview, observation, documentAnalysis].filter(Boolean).length

    return {
      finding: finding.name,
      interview,
      observation,
      documentAnalysis,
      coincidence: getCoincidence(count),
      interpretation: finding.interpretation,
    }
  })

  return (
    <main className="p-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-700">
          Matriz metodológica
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Triangulación de instrumentos
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Cruce automático de hallazgos identificados en entrevistas,
          observación directa y análisis documental.
        </p>
      </div>

      <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="p-4 text-sm font-bold">Hallazgo</th>
                <th className="p-4 text-sm font-bold">Entrevista</th>
                <th className="p-4 text-sm font-bold">Observación</th>
                <th className="p-4 text-sm font-bold">Análisis documental</th>
                <th className="p-4 text-sm font-bold">
                  Coincidencia entre instrumentos
                </th>
                <th className="p-4 text-sm font-bold">Interpretación</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.finding} className="border-b border-slate-100">
                  <td className="p-4 font-black text-slate-900">
                    {row.finding}
                  </td>
                  <td className="p-4">
                    <YesNoBadge value={row.interview} />
                  </td>
                  <td className="p-4">
                    <YesNoBadge value={row.observation} />
                  </td>
                  <td className="p-4">
                    <YesNoBadge value={row.documentAnalysis} />
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-bold text-cyan-800">
                      {row.coincidence}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {row.interpretation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}