"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type ObservationActivity = {
  id: string
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

type Observation = {
  id: string
  code: string | null
  date: string | null
  area: string | null
  responsible: string | null
  startTime: string | null
  endTime: string | null
  generalResult: string | null
  activities: ObservationActivity[]
}

type DraftActivity = {
  previousActivity: string
  currentActivity: string
  nextActivity: string
  responsible: string
  document: string
  tool: string
  timeSpent: string
  waitingTime: string
  error: string
  cause: string
  reprocess: boolean
  duplicated: boolean
  noValue: boolean
  delayType: string
  automationOpportunity: string
  notes: string
}

type ObservationsClientProps = {
  initialObservations: Observation[]
}

type Indicators = {
  totalTime: number
  averageTime: number
  totalWaiting: number
  errorsCount: number
  reprocessCount: number
  manualValidations: number
  predominantTool: string
  slowestActivity: string
}

const emptyActivity: DraftActivity = {
  previousActivity: "",
  currentActivity: "",
  nextActivity: "",
  responsible: "",
  document: "",
  tool: "",
  timeSpent: "",
  waitingTime: "",
  error: "",
  cause: "",
  reprocess: false,
  duplicated: false,
  noValue: false,
  delayType: "",
  automationOpportunity: "",
  notes: "",
}

const tools = [
  "Excel",
  "ERP",
  "Correo electrónico",
  "Carpeta compartida",
  "Validación manual",
  "Otro",
]

const errors = [
  "Digitación",
  "Omisión de información",
  "Inconsistencia documental",
  "Duplicidad",
  "Otro",
]

const causes = [
  "Falta de información",
  "Error humano",
  "Falta de sistema",
  "Validación manual",
  "Demora de otra área",
  "Ausencia de formato estándar",
  "Otro",
]

const delayTypes = [
  "Espera entre áreas",
  "Corrección documental",
  "Revisión manual",
  "Búsqueda de información",
  "Aprobación",
  "Otro",
]

const automationOptions = [
  "Alerta automática",
  "Integración con ERP",
  "Validación automática",
  "Repositorio centralizado",
  "Generación automática de documentos",
  "Otro",
]

function getPredominantTool(activities: DraftActivity[]): string {
  const counter = new Map<string, number>()

  activities.forEach((activity) => {
    if (!activity.tool) return
    counter.set(activity.tool, (counter.get(activity.tool) ?? 0) + 1)
  })

  let predominant = "-"
  let max = 0

  counter.forEach((count, tool) => {
    if (count > max) {
      max = count
      predominant = tool
    }
  })

  return predominant
}

function getSlowestActivity(activities: DraftActivity[]): string {
  let slowestActivity = "-"
  let maxTime = 0

  activities.forEach((activity) => {
    const time = Number(activity.timeSpent)

    if (Number.isFinite(time) && time > maxTime) {
      maxTime = time
      slowestActivity = activity.currentActivity || "Actividad sin nombre"
    }
  })

  return slowestActivity
}

function calculateIndicators(activities: DraftActivity[]): Indicators {
  const timeValues = activities
    .map((activity) => Number(activity.timeSpent))
    .filter((value) => Number.isFinite(value) && value > 0)

  const waitingValues = activities
    .map((activity) => Number(activity.waitingTime))
    .filter((value) => Number.isFinite(value) && value > 0)

  const totalTime = timeValues.reduce((sum, value) => sum + value, 0)
  const totalWaiting = waitingValues.reduce((sum, value) => sum + value, 0)

  return {
    totalTime,
    averageTime:
      timeValues.length > 0 ? Math.round(totalTime / timeValues.length) : 0,
    totalWaiting,
    errorsCount: activities.filter((activity) => activity.error).length,
    reprocessCount: activities.filter((activity) => activity.reprocess).length,
    manualValidations: activities.filter(
      (activity) => activity.tool === "Validación manual"
    ).length,
    predominantTool: getPredominantTool(activities),
    slowestActivity: getSlowestActivity(activities),
  }
}

export default function ObservationsClient({
  initialObservations,
}: ObservationsClientProps) {
  const router = useRouter()

  const [code, setCode] = useState("")
  const [date, setDate] = useState("")
  const [area, setArea] = useState("")
  const [responsible, setResponsible] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [generalResult, setGeneralResult] = useState("")
  const [activities, setActivities] = useState<DraftActivity[]>([
    { ...emptyActivity },
  ])
  const [saving, setSaving] = useState(false)
  const [selectedObservationId, setSelectedObservationId] = useState<
    string | null
  >(initialObservations[0]?.id ?? null)

  const selectedObservation =
    initialObservations.find((item) => item.id === selectedObservationId) ??
    null

  const previewIndicators = useMemo(
    () => calculateIndicators(activities),
    [activities]
  )

  function updateActivity(
    index: number,
    field: keyof DraftActivity,
    value: string | boolean
  ) {
    setActivities((current) =>
      current.map((activity, activityIndex) =>
        activityIndex === index
          ? {
              ...activity,
              [field]: value,
            }
          : activity
      )
    )
  }

  function addActivity() {
    setActivities((current) => [...current, { ...emptyActivity }])
  }

  function removeActivity(index: number) {
    setActivities((current) =>
      current.length === 1
        ? current
        : current.filter((_, activityIndex) => activityIndex !== index)
    )
  }

  async function createObservation() {
    setSaving(true)

    try {
      await fetch("/api/observations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          date,
          area,
          responsible,
          startTime,
          endTime,
          generalResult,
          activities: activities.map((activity) => ({
            ...activity,
            timeSpent: activity.timeSpent
              ? Number(activity.timeSpent)
              : undefined,
            waitingTime: activity.waitingTime
              ? Number(activity.waitingTime)
              : undefined,
          })),
        }),
      })

      setCode("")
      setDate("")
      setArea("")
      setResponsible("")
      setStartTime("")
      setEndTime("")
      setGeneralResult("")
      setActivities([{ ...emptyActivity }])

      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="p-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-700">
          Instrumento 2
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Ficha de observación del proceso documentario
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Registro del flujo real del proceso documentario, actividades,
          responsables, documentos, herramientas, tiempos, errores, reprocesos,
          demoras y oportunidades de automatización.
        </p>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Datos generales
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Código de observación"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={date}
            onChange={(event) => setDate(event.target.value)}
            type="date"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="Área observada"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={responsible}
            onChange={(event) => setResponsible(event.target.value)}
            placeholder="Responsable observado"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            placeholder="Hora de inicio"
            type="time"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            placeholder="Hora de término"
            type="time"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">
            Registro de observación
          </h3>

          <button
            onClick={addActivity}
            className="rounded-2xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800"
          >
            + Agregar actividad
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900">
                  Actividad {index + 1}
                </h4>

                <button
                  onClick={() => removeActivity(index)}
                  className="text-sm font-bold text-red-600 transition hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <input
                  value={activity.previousActivity}
                  onChange={(event) =>
                    updateActivity(index, "previousActivity", event.target.value)
                  }
                  placeholder="Actividad anterior"
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                />

                <input
                  value={activity.currentActivity}
                  onChange={(event) =>
                    updateActivity(index, "currentActivity", event.target.value)
                  }
                  placeholder="Actividad observada"
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                />

                <input
                  value={activity.nextActivity}
                  onChange={(event) =>
                    updateActivity(index, "nextActivity", event.target.value)
                  }
                  placeholder="Actividad siguiente"
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                />

                <input
                  value={activity.responsible}
                  onChange={(event) =>
                    updateActivity(index, "responsible", event.target.value)
                  }
                  placeholder="Responsable"
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                />

                <input
                  value={activity.document}
                  onChange={(event) =>
                    updateActivity(index, "document", event.target.value)
                  }
                  placeholder="Documento utilizado"
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                />

                <select
                  value={activity.tool}
                  onChange={(event) =>
                    updateActivity(index, "tool", event.target.value)
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                >
                  <option value="">Herramienta utilizada</option>
                  {tools.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <input
                  value={activity.timeSpent}
                  onChange={(event) =>
                    updateActivity(index, "timeSpent", event.target.value)
                  }
                  type="number"
                  placeholder="Tiempo empleado (min)"
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                />

                <input
                  value={activity.waitingTime}
                  onChange={(event) =>
                    updateActivity(index, "waitingTime", event.target.value)
                  }
                  type="number"
                  placeholder="Tiempo de espera (min)"
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                />

                <select
                  value={activity.error}
                  onChange={(event) =>
                    updateActivity(index, "error", event.target.value)
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                >
                  <option value="">Error detectado</option>
                  {errors.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={activity.cause}
                  onChange={(event) =>
                    updateActivity(index, "cause", event.target.value)
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                >
                  <option value="">Posible causa de la deficiencia</option>
                  {causes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={activity.delayType}
                  onChange={(event) =>
                    updateActivity(index, "delayType", event.target.value)
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                >
                  <option value="">Tipo de demora</option>
                  {delayTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={activity.automationOpportunity}
                  onChange={(event) =>
                    updateActivity(
                      index,
                      "automationOpportunity",
                      event.target.value
                    )
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
                >
                  <option value="">Oportunidad de automatización</option>
                  {automationOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={activity.reprocess}
                    onChange={(event) =>
                      updateActivity(index, "reprocess", event.target.checked)
                    }
                  />
                  Reproceso
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={activity.duplicated}
                    onChange={(event) =>
                      updateActivity(index, "duplicated", event.target.checked)
                    }
                  />
                  Actividad duplicada
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={activity.noValue}
                    onChange={(event) =>
                      updateActivity(index, "noValue", event.target.checked)
                    }
                  />
                  Actividad que no agrega valor
                </label>
              </div>

              <textarea
                value={activity.notes}
                onChange={(event) =>
                  updateActivity(index, "notes", event.target.value)
                }
                placeholder="Observaciones"
                className="mt-4 min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600"
              />
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-black text-slate-900">
            Indicadores operativos observados
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">
                Tiempo total del proceso observado
              </p>
              <p className="mt-2 text-2xl font-black">
                {previewIndicators.totalTime} min
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">
                Tiempo promedio por actividad
              </p>
              <p className="mt-2 text-2xl font-black">
                {previewIndicators.averageTime} min
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">
                Tiempo de espera entre áreas
              </p>
              <p className="mt-2 text-2xl font-black">
                {previewIndicators.totalWaiting} min
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">
                Número aproximado de errores
              </p>
              <p className="mt-2 text-2xl font-black">
                {previewIndicators.errorsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">
                Número de reprocesos
              </p>
              <p className="mt-2 text-2xl font-black">
                {previewIndicators.reprocessCount}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">
                Validaciones manuales
              </p>
              <p className="mt-2 text-2xl font-black">
                {previewIndicators.manualValidations}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">
                Herramienta más utilizada
              </p>
              <p className="mt-2 text-xl font-black">
                {previewIndicators.predominantTool}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">
                Actividad con mayor demora
              </p>
              <p className="mt-2 text-xl font-black">
                {previewIndicators.slowestActivity}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <label className="text-sm font-bold text-slate-700">
            Resultado general de observación
          </label>

          <textarea
            value={generalResult}
            onChange={(event) => setGeneralResult(event.target.value)}
            placeholder="Describa el resultado general de la observación..."
            className="mt-3 min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none focus:border-cyan-600"
          />
        </div>

        <button
          onClick={createObservation}
          disabled={saving}
          className="mt-6 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar observación"}
        </button>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">
            Observaciones registradas
          </h2>

          <div className="mt-4 grid gap-3">
            {initialObservations.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Aún no hay observaciones registradas.
              </p>
            ) : (
              initialObservations.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedObservationId(item.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedObservationId === item.id
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
                    {item.responsible || "Sin responsable"}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {!selectedObservation ? (
            <p className="text-slate-500">
              Selecciona una observación para ver sus actividades.
            </p>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-950">
                {selectedObservation.code || "Observación"}
              </h2>

              <p className="mt-1 text-slate-600">
                {selectedObservation.area || "Sin área"} ·{" "}
                {selectedObservation.responsible || "Sin responsable"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Inicio: {selectedObservation.startTime || "-"} · Término:{" "}
                {selectedObservation.endTime || "-"}
              </p>

              <div className="mt-6 grid gap-4">
                {selectedObservation.activities.map((activity) => (
                  <article
                    key={activity.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <h3 className="font-black text-slate-900">
                      {activity.currentActivity || "Actividad sin nombre"}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      Secuencia: {activity.previousActivity || "-"} →{" "}
                      {activity.currentActivity || "-"} →{" "}
                      {activity.nextActivity || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Documento: {activity.document || "-"} · Herramienta:{" "}
                      {activity.tool || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Tiempo empleado: {activity.timeSpent ?? 0} min · Tiempo
                      de espera: {activity.waitingTime ?? 0} min
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Error: {activity.error || "-"} · Causa:{" "}
                      {activity.cause || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Reproceso: {activity.reprocess ? "Sí" : "No"} · Duplicada:{" "}
                      {activity.duplicated ? "Sí" : "No"} · No agrega valor:{" "}
                      {activity.noValue ? "Sí" : "No"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Tipo de demora: {activity.delayType || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Oportunidad de automatización:{" "}
                      {activity.automationOpportunity || "-"}
                    </p>

                    {activity.notes ? (
                      <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-600">
                        {activity.notes}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>

              {selectedObservation.generalResult ? (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                  <h3 className="font-black text-slate-900">
                    Resultado general de observación
                  </h3>
                  <p className="mt-2 text-slate-600">
                    {selectedObservation.generalResult}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </section>
      </section>
    </main>
  )
}