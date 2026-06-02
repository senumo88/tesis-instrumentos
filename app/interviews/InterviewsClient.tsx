"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type InterviewAnswer = {
  id: string
  questionNumber: number
  category: string | null
  objective: string | null
  question: string
  answer: string | null
  finding: string | null
  evidence: string | null
}

type Interview = {
  id: string
  code: string | null
  area: string | null
  position: string | null
  interviewee: string | null
  durationMinutes: number | null
  generalNotes: string | null
  answers: InterviewAnswer[]
}

type InterviewsClientProps = {
  initialInterviews: Interview[]
}

const findings = [
  "Demoras documentarias",
  "Reprocesos",
  "Uso excesivo de Excel",
  "Validaciones manuales",
  "Falta de estandarización",
  "Errores documentarios",
  "Requerimientos de automatización",
]

export default function InterviewsClient({
  initialInterviews,
}: InterviewsClientProps) {
  const router = useRouter()

  const [code, setCode] = useState("")
  const [area, setArea] = useState("")
  const [position, setPosition] = useState("")
  const [interviewee, setInterviewee] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [generalNotes, setGeneralNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [savingAnswerId, setSavingAnswerId] = useState<string | null>(null)
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(
    initialInterviews[0]?.id ?? null
  )

  const selectedInterview =
    initialInterviews.find((item) => item.id === selectedInterviewId) ?? null

  async function createInterview() {
    setSaving(true)

    try {
      await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          area,
          position,
          interviewee,
          durationMinutes: durationMinutes
            ? Number(durationMinutes)
            : undefined,
          generalNotes,
        }),
      })

      setCode("")
      setArea("")
      setPosition("")
      setInterviewee("")
      setDurationMinutes("")
      setGeneralNotes("")

      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function updateAnswer(
    answerId: string,
    payload: {
      answer?: string
      finding?: string
      evidence?: string
    }
  ) {
    setSavingAnswerId(answerId)

    try {
      await fetch(`/api/interview-answers/${answerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      router.refresh()
    } finally {
      setSavingAnswerId(null)
    }
  }

  return (
    <main className="p-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-700">
          Instrumento 1
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Guía de entrevista semiestructurada
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Registro de entrevistas alineadas a los objetivos específicos,
          categorías de análisis y hallazgos para triangulación metodológica.
        </p>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Nueva entrevista
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Código de entrevista"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={interviewee}
            onChange={(event) => setInterviewee(event.target.value)}
            placeholder="Entrevistado"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="Área"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="Cargo"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            placeholder="Duración en minutos"
            type="number"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={generalNotes}
            onChange={(event) => setGeneralNotes(event.target.value)}
            placeholder="Observaciones generales"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />
        </div>

        <button
          onClick={createInterview}
          disabled={saving}
          className="mt-6 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Crear entrevista con 20 preguntas"}
        </button>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">
            Entrevistas registradas
          </h2>

          <div className="mt-4 grid gap-3">
            {initialInterviews.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Aún no hay entrevistas registradas.
              </p>
            ) : (
              initialInterviews.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedInterviewId(item.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedInterviewId === item.id
                      ? "border-cyan-600 bg-cyan-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-black text-slate-900">
                    {item.code || "Sin código"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.area || "Sin área"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.position || "Sin cargo"}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {!selectedInterview ? (
            <p className="text-slate-500">
              Selecciona una entrevista para ver sus preguntas.
            </p>
          ) : (
            <>
              <div className="border-b border-slate-200 pb-5">
                <h2 className="text-2xl font-black text-slate-950">
                  {selectedInterview.code || "Entrevista"}
                </h2>
                <p className="mt-1 text-slate-600">
                  {selectedInterview.interviewee || "Sin entrevistado"} ·{" "}
                  {selectedInterview.area || "Sin área"} ·{" "}
                  {selectedInterview.position || "Sin cargo"}
                </p>
              </div>

              <div className="mt-6 grid gap-5">
                {selectedInterview.answers.map((answer) => (
                  <article
                    key={answer.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                        P{answer.questionNumber}
                      </span>
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                        {answer.objective}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {answer.category}
                      </span>
                    </div>

                    <p className="mt-4 font-bold text-slate-900">
                      {answer.question}
                    </p>

                    <textarea
                      defaultValue={answer.answer ?? ""}
                      onBlur={(event) =>
                        updateAnswer(answer.id, {
                          answer: event.target.value,
                        })
                      }
                      placeholder="Respuesta del entrevistado..."
                      className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none focus:border-cyan-600"
                    />

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <select
                        defaultValue={answer.finding ?? ""}
                        onChange={(event) =>
                          updateAnswer(answer.id, {
                            finding: event.target.value,
                          })
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                      >
                        <option value="">Seleccionar hallazgo</option>
                        {findings.map((finding) => (
                          <option key={finding} value={finding}>
                            {finding}
                          </option>
                        ))}
                      </select>

                      <input
                        defaultValue={answer.evidence ?? ""}
                        onBlur={(event) =>
                          updateAnswer(answer.id, {
                            evidence: event.target.value,
                          })
                        }
                        placeholder="Evidencia o nota clave"
                        className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                      />
                    </div>

                    {savingAnswerId === answer.id ? (
                      <p className="mt-3 text-xs font-bold text-cyan-700">
                        Guardando...
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  )
}