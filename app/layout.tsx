import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Urbanist, Inter } from "next/font/google"

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Obio.ai - The AI That Grows With You",
  description: "Your personal AI companion for self-discovery and better life decisions.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${inter.variable}`}>
      <head>
        {/* Încarcă stilurile și scripturile widgetului în head */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/biel-search/dist/biel-search/biel-search.css"
        />
        <script type="module" src="https://cdn.jsdelivr.net/npm/biel-search/dist/biel-search/biel-search.esm.js" />
      </head>
      <body>
        {children}

        {/* Widget Biel.ai Chatbot */}
        <biel-button
          project="rrcrfrnu7r"
          header-title="Biel.ai Chatbot"
          button-position="bottom-right"
          modal-position="sidebar-right"
          button-style="dark"
        >
          Ask AI
        </biel-button>
      </body>
    </html>
  )
}
