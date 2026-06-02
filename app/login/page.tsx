"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function login() {
    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        setErrorMessage("Credenciales incorrectas")
        return
      }

      router.push("/")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-700">
          Plataforma de tesis
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Iniciar sesión
        </h1>

        <div className="mt-8 grid gap-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Correo"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Contraseña"
            className="rounded-2xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-cyan-600"
          />

          {errorMessage ? (
            <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            onClick={login}
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </section>
    </main>
  )
}