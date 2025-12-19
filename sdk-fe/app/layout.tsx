import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PrivyProviderWrapper } from "@/components/privy-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "x402 DevKit - Monetize APIs on Mantle",
  description:
    "The complete developer toolkit for x402 payments on Mantle. Build, test, and monitor paid APIs in minutes.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <PrivyProviderWrapper>{children}</PrivyProviderWrapper>
        <Analytics />
      </body>
    </html>
  )
}
