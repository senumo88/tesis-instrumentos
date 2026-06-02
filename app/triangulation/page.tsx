import { prisma } from "../../lib/prisma"

type TriangulationRow = {
  finding: string
  interview: boolean
  observation: boolean
  documentAnalysis: boolean
  coincidence: "Alta" | "Media" | "Baja" | "Sin evidencia"
  interpretation: string
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

export default async function TriangulationPage() {
  const interviews = await prisma.interview.findMany({
    include: {
      answers: true,
    },
  })

  const observations = await prisma.observation.findMany({
    include: {
      activities: true,
    },
  })

  const analyses = await prisma.documentAnalysis.findMany({
    include: {
      records: true,
    },
  })

  const rows: TriangulationRow[] = findings.map((finding) => {
    const interview = interviews.some((interviewItem) =>
      interviewItem.answers.some(
        (answer) => answer.finding === finding.name
      )
    )

    const observation = observations.some((observationItem) =>
      observationItem.activities.some((activity) => {
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

    const documentAnalysis = analyses.some((analysisItem) =>
      analysisItem.records.some((record) => {
        if (finding.name === "Demoras documentarias") {
          return record.delayDetected || record.errorImpact === "Demora en aprobación"
        }

        if (finding.name === "Reprocesos") {
          return record.reprocess
        }

        if (finding.name === "Uso excesivo de Excel") {
          return (
            record.mediumUsed === "Excel" ||
            record.excessiveExcelEmailUse
          )
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
  <span
    className={`rounded-full px-3 py-1 text-sm font-bold ${
      row.interview
        ? "bg-emerald-100 text-emerald-800"
        : "bg-rose-100 text-rose-700"
    }`}
  >
    {row.interview ? "Sí" : "No"}
  </span>
</td>

<td className="p-4">
  <span
    className={`rounded-full px-3 py-1 text-sm font-bold ${
      row.observation
        ? "bg-emerald-100 text-emerald-800"
        : "bg-rose-100 text-rose-700"
    }`}
  >
    {row.observation ? "Sí" : "No"}
  </span>
</td>

<td className="p-4">
  <span
    className={`rounded-full px-3 py-1 text-sm font-bold ${
      row.documentAnalysis
        ? "bg-emerald-100 text-emerald-800"
        : "bg-rose-100 text-rose-700"
    }`}
  >
    {row.documentAnalysis ? "Sí" : "No"}
  </span>
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

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Criterio de interpretación
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-slate-900">Alta</p>
            <p className="mt-1 text-sm text-slate-600">
              El hallazgo aparece en los tres instrumentos.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-slate-900">Media</p>
            <p className="mt-1 text-sm text-slate-600">
              El hallazgo aparece en dos instrumentos.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-slate-900">Baja</p>
            <p className="mt-1 text-sm text-slate-600">
              El hallazgo aparece en un solo instrumento.
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-600">
          La triangulación metodológica permite verificar si un problema aparece
          en más de una fuente de información. Cuando un hallazgo se evidencia en
          entrevista, observación y análisis documental, presenta mayor
          consistencia para la interpretación del proceso documentario.
        </p>
      </section>
    </main>
  )
}