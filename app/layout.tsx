import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "@/components/Sidebar"

export const metadata: Metadata = {
  title: "Tesis Instrumentos",
  description: "Plataforma de apoyo para instrumentos de tesis",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}