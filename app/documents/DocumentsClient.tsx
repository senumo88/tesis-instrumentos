"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type DocumentRecord = {
  id: string
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
}

type DocumentAnalysis = {
  id: string
  code: string | null
  date: string | null
  area: string | null
  responsible: string | null
  generalResult: string | null
  records: DocumentRecord[]
}

type DraftRecord = {
  documentName: string
  documentType: string
  processStage: string
  areaResponsible: string
  purpose: string
  mediumUsed: string
  detectedError: string
  probableCause: string
  errorImpact: string
  validationType: string
  validationsRequired: string
  reprocess: boolean
  duplicated: boolean
  repetitiveValidation: boolean
  delayDetected: boolean
  excessiveExcelEmailUse: boolean
  documentValue: string
  automatable: boolean
  technologicalRequirement: string
  digitalizationOpportunity: string
  notes: string
}

type DocumentsClientProps = {
  initialAnalyses: DocumentAnalysis[]
}

type Indicators = {
  totalDocuments: number
  documentsWithErrors: number
  reprocessCount: number
  manualValidations: number
  predominantMedium: string
  documentWithMostErrors: string
  documentWithMostAutomationOpportunity: string
}

const emptyRecord: DraftRecord = {
  documentName: "",
  documentType: "",
  processStage: "",
  areaResponsible: "",
  purpose: "",
  mediumUsed: "",
  detectedError: "",
  probableCause: "",
  errorImpact: "",
  validationType: "",
  validationsRequired: "",
  reprocess: false,
  duplicated: false,
  repetitiveValidation: false,
  delayDetected: false,
  excessiveExcelEmailUse: false,
  documentValue: "",
  automatable: false,
  technologicalRequirement: "",
  digitalizationOpportunity: "",
  notes: "",
}

const processStages = [
  "Recepción",
  "Elaboración",
  "Revisión",
  "Validación",
  "Aprobación",
  "Entrega",
]

const documentTypes = [
  "Comercial",
  "Legal",
  "Operativo",
  "Logístico",
  "Soporte",
  "Otro",
]

const mediums = [
  "Excel",
  "ERP",
  "Correo electrónico",
  "Sistema interno",
  "Archivo físico",
  "Carpeta compartida",
  "Otro",
]

const errors = [
  "Digitación",
  "Información incompleta",
  "Inconsistencia documental",
  "Duplicidad",
  "Falta de estandarización",
  "Otro",
]

const causes = [
  "Datos incompletos enviados por otra área",
  "Falta de validación cruzada",
  "Uso de múltiples archivos Excel",
  "Validación manual",
  "Ausencia de formato estándar",
  "Falta de integración entre sistemas",
  "Otro",
]

const impacts = [
  "Retraso operativo",
  "Corrección documental",
  "Observación del cliente",
  "Demora en aprobación",
  "Reproceso administrativo",
  "Otro",
]

const validationTypes = [
  "Revisión manual",
  "Aprobación entre áreas",
  "Corrección documental",
  "Confirmación de datos",
  "Otro",
]

const documentValues = [
  "Valor operativo",
  "Valor legal",
  "Valor comercial",
  "No agrega valor / genera duplicidad",
]

const technologicalRequirements = [
  "Validación automática de campos",
  "Integración con ERP o base de datos",
  "Seguimiento del estado documental",
  "Generación automática de documentos",
  "Repositorio documental centralizado",
  "Otro",
]

function getPredominantMedium(records: DraftRecord[]): string {
  const counter = new Map<string, number>()

  records.forEach((record) => {
    if (!record.mediumUsed) return
    counter.set(record.mediumUsed, (counter.get(record.mediumUsed) ?? 0) + 1)
  })

  let predominant = "-"
  let max = 0

  counter.forEach((count, medium) => {
    if (count > max) {
      max = count
      predominant = medium
    }
  })

  return predominant
}

function getDocumentWithMostErrors(records: DraftRecord[]): string {
  const counter = new Map<string, number>()

  records.forEach((record) => {
    if (!record.documentName || !record.detectedError) return
    counter.set(record.documentName, (counter.get(record.documentName) ?? 0) + 1)
  })

  let documentName = "-"
  let max = 0

  counter.forEach((count, name) => {
    if (count > max) {
      max = count
      documentName = name
    }
  })

  return documentName
}

function getDocumentWithMostAutomation(records: DraftRecord[]): string {
  const automatableRecord = records.find(
    (record) => record.automatable && record.documentName
  )

  return automatableRecord?.documentName || "-"
}

function calculateIndicators(records: DraftRecord[]): Indicators {
  return {
    totalDocuments: records.filter((record) => record.documentName).length,
    documentsWithErrors: records.filter((record) => record.detectedError).length,
    reprocessCount: records.filter((record) => record.reprocess).length,
    manualValidations: records.filter(
      (record) => record.validationType === "Revisión manual"
    ).length,
    predominantMedium: getPredominantMedium(records),
    documentWithMostErrors: getDocumentWithMostErrors(records),
    documentWithMostAutomationOpportunity: getDocumentWithMostAutomation(records),
  }
}

export default function DocumentsClient({
  initialAnalyses,
}: DocumentsClientProps) {
  const router = useRouter()

  const [code, setCode] = useState("")
  const [date, setDate] = useState("")
  const [area, setArea] = useState("")
  const [responsible, setResponsible] = useState("")
  const [generalResult, setGeneralResult] = useState("")
  const [records, setRecords] = useState<DraftRecord[]>([{ ...emptyRecord }])
  const [saving, setSaving] = useState(false)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    initialAnalyses[0]?.id ?? null
  )

  const selectedAnalysis =
    initialAnalyses.find((item) => item.id === selectedAnalysisId) ?? null

  const previewIndicators = useMemo(
    () => calculateIndicators(records),
    [records]
  )

  function updateRecord(
    index: number,
    field: keyof DraftRecord,
    value: string | boolean
  ) {
    setRecords((current) =>
      current.map((record, recordIndex) =>
        recordIndex === index
          ? {
              ...record,
              [field]: value,
            }
          : record
      )
    )
  }

  function addRecord() {
    setRecords((current) => [...current, { ...emptyRecord }])
  }

  function removeRecord(index: number) {
    setRecords((current) =>
      current.length === 1
        ? current
        : current.filter((_, recordIndex) => recordIndex !== index)
    )
  }

  async function createAnalysis() {
    setSaving(true)

    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          date,
          area,
          responsible,
          generalResult,
          records: records.map((record) => ({
            ...record,
            validationsRequired: record.validationsRequired
              ? Number(record.validationsRequired)
              : undefined,
          })),
        }),
      })

      setCode("")
      setDate("")
      setArea("")
      setResponsible("")
      setGeneralResult("")
      setRecords([{ ...emptyRecord }])

      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="p-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-700">
          Instrumento 3
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Matriz de análisis documental
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Registro de documentos, errores, causas, impactos, validaciones,
          duplicidades, valor documental y requerimientos tecnológicos.
        </p>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Datos generales
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código de análisis" className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600" />
          <input value={date} onChange={(event) => setDate(event.target.value)} type="date" className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600" />
          <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Área evaluada" className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600" />
          <input value={responsible} onChange={(event) => setResponsible(event.target.value)} placeholder="Responsable" className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600" />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">
            Registro documental
          </h3>

          <button onClick={addRecord} className="rounded-2xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800">
            + Agregar documento
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          {records.map((record, index) => (
            <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900">
                  Documento {index + 1}
                </h4>

                <button onClick={() => removeRecord(index)} className="text-sm font-bold text-red-600 transition hover:text-red-700">
                  Eliminar
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <input value={record.documentName} onChange={(event) => updateRecord(index, "documentName", event.target.value)} placeholder="Documento analizado" className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600" />

                <select value={record.documentType} onChange={(event) => updateRecord(index, "documentType", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Tipo de documento</option>
                  {documentTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select value={record.processStage} onChange={(event) => updateRecord(index, "processStage", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Etapa del proceso</option>
                  {processStages.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <input value={record.areaResponsible} onChange={(event) => updateRecord(index, "areaResponsible", event.target.value)} placeholder="Área responsable" className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600" />

                <input value={record.purpose} onChange={(event) => updateRecord(index, "purpose", event.target.value)} placeholder="Finalidad del documento" className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600" />

                <select value={record.mediumUsed} onChange={(event) => updateRecord(index, "mediumUsed", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Medio utilizado</option>
                  {mediums.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select value={record.detectedError} onChange={(event) => updateRecord(index, "detectedError", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Error detectado</option>
                  {errors.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select value={record.probableCause} onChange={(event) => updateRecord(index, "probableCause", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Causa probable</option>
                  {causes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select value={record.errorImpact} onChange={(event) => updateRecord(index, "errorImpact", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Impacto del error</option>
                  {impacts.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select value={record.validationType} onChange={(event) => updateRecord(index, "validationType", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Tipo de validación</option>
                  {validationTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <input value={record.validationsRequired} onChange={(event) => updateRecord(index, "validationsRequired", event.target.value)} type="number" placeholder="N° validaciones requeridas" className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600" />

                <select value={record.documentValue} onChange={(event) => updateRecord(index, "documentValue", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Valor del documento</option>
                  {documentValues.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select value={record.technologicalRequirement} onChange={(event) => updateRecord(index, "technologicalRequirement", event.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600">
                  <option value="">Requerimiento tecnológico</option>
                  {technologicalRequirements.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <input value={record.digitalizationOpportunity} onChange={(event) => updateRecord(index, "digitalizationOpportunity", event.target.value)} placeholder="Oportunidad de digitalización" className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600" />
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={record.reprocess} onChange={(event) => updateRecord(index, "reprocess", event.target.checked)} />
                  Reproceso
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={record.duplicated} onChange={(event) => updateRecord(index, "duplicated", event.target.checked)} />
                  Duplicidad
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={record.repetitiveValidation} onChange={(event) => updateRecord(index, "repetitiveValidation", event.target.checked)} />
                  Validación repetitiva
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={record.delayDetected} onChange={(event) => updateRecord(index, "delayDetected", event.target.checked)} />
                  Demora
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={record.excessiveExcelEmailUse} onChange={(event) => updateRecord(index, "excessiveExcelEmailUse", event.target.checked)} />
                  Uso excesivo de Excel/correo
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={record.automatable} onChange={(event) => updateRecord(index, "automatable", event.target.checked)} />
                  Documento automatizable
                </label>
              </div>

              <textarea value={record.notes} onChange={(event) => updateRecord(index, "notes", event.target.value)} placeholder="Observaciones" className="mt-4 min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-cyan-600" />
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-black text-slate-900">
            Indicadores operativos observados
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <IndicatorCard label="Documentos analizados" value={String(previewIndicators.totalDocuments)} />
            <IndicatorCard label="Documentos con errores" value={String(previewIndicators.documentsWithErrors)} />
            <IndicatorCard label="Reprocesos documentarios" value={String(previewIndicators.reprocessCount)} />
            <IndicatorCard label="Validaciones manuales" value={String(previewIndicators.manualValidations)} />
            <IndicatorCard label="Medio predominante" value={previewIndicators.predominantMedium} />
            <IndicatorCard label="Documento con mayor incidencia de errores" value={previewIndicators.documentWithMostErrors} />
            <IndicatorCard label="Mayor oportunidad de automatización" value={previewIndicators.documentWithMostAutomationOpportunity} />
          </div>
        </section>

        <div className="mt-8">
          <label className="text-sm font-bold text-slate-700">
            Resultado general de análisis documental
          </label>

          <textarea value={generalResult} onChange={(event) => setGeneralResult(event.target.value)} placeholder="Describa el resultado general del análisis documental..." className="mt-3 min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none focus:border-cyan-600" />
        </div>

        <button onClick={createAnalysis} disabled={saving} className="mt-6 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
          {saving ? "Guardando..." : "Guardar análisis documental"}
        </button>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">
            Análisis registrados
          </h2>

          <div className="mt-4 grid gap-3">
            {initialAnalyses.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Aún no hay análisis documentales registrados.
              </p>
            ) : (
              initialAnalyses.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedAnalysisId(item.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedAnalysisId === item.id
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
          {!selectedAnalysis ? (
            <p className="text-slate-500">
              Selecciona un análisis para ver sus documentos.
            </p>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-950">
                {selectedAnalysis.code || "Análisis documental"}
              </h2>

              <p className="mt-1 text-slate-600">
                {selectedAnalysis.area || "Sin área"} ·{" "}
                {selectedAnalysis.responsible || "Sin responsable"}
              </p>

              <div className="mt-6 grid gap-4">
                {selectedAnalysis.records.map((record) => (
                  <article key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="font-black text-slate-900">
                      {record.documentName || "Documento sin nombre"}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      Etapa: {record.processStage || "-"} · Medio:{" "}
                      {record.mediumUsed || "-"} · Valor:{" "}
                      {record.documentValue || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Error: {record.detectedError || "-"} · Causa:{" "}
                      {record.probableCause || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Impacto: {record.errorImpact || "-"} · Validación:{" "}
                      {record.validationType || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Requerimiento tecnológico:{" "}
                      {record.technologicalRequirement || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Reproceso: {record.reprocess ? "Sí" : "No"} · Duplicidad:{" "}
                      {record.duplicated ? "Sí" : "No"} · Automatizable:{" "}
                      {record.automatable ? "Sí" : "No"}
                    </p>

                    {record.notes ? (
                      <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-600">
                        {record.notes}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>

              {selectedAnalysis.generalResult ? (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                  <h3 className="font-black text-slate-900">
                    Resultado general de análisis documental
                  </h3>
                  <p className="mt-2 text-slate-600">
                    {selectedAnalysis.generalResult}
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

function IndicatorCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-slate-950 p-5 text-white">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  )
}