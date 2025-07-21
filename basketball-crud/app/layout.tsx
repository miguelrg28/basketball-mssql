import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Basketball Management System",
  description: "Sistema de gestión de basketball - Creado por Samuel Olivo y Miguel Rodríguez",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
          <Navigation />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <footer className="bg-orange-900 text-white py-4 mt-16">
            <div className="container mx-auto px-4 text-center">
              <p>© 2024 Basketball Management System - Creado por Samuel Olivo y Miguel Rodríguez</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
