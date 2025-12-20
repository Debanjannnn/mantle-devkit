import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PrivyProviderWrapper } from "@/components/privy-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "x402 DevKit - Monetize APIs on Mantle Network",
  description:
    "The complete developer toolkit for x402 payments on Mantle. Build, test, and monitor paid APIs in minutes. Server SDK, client library, monitoring dashboard, and local testing.",
  keywords: [
    "x402",
    "mantle",
    "MNT",
    "musd",
    "devkit",
    "x402 DevKit",
    "Mantle Network",
    "API monetization",
    "paid APIs",
    "micropayments",
    "blockchain payments",
    "web3 payments",
    "API payments",
    "HTTP 402",
    "payment protocol",
    "developer toolkit",
    "Mantle Sepolia",
    "MNT token",
    "USDC payments",
    "mETH",
    "WMNT",
  ],
  authors: [{ name: "x402 DevKit" }],
  creator: "x402 DevKit",
  publisher: "x402 DevKit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://devkit.x402.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "x402 DevKit - Monetize APIs on Mantle Network",
    description:
      "The complete developer toolkit for x402 payments on Mantle. Build, test, and monitor paid APIs in minutes.",
    url: "/",
    siteName: "x402 DevKit",
    images: [
      {
        url: "/X402.png",
        width: 1200,
        height: 630,
        alt: "x402 DevKit Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "x402 DevKit - Monetize APIs on Mantle Network",
    description:
      "The complete developer toolkit for x402 payments on Mantle. Build, test, and monitor paid APIs in minutes.",
    images: ["/X402.png"],
    creator: "@x402devkit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/X402.png",
    shortcut: "/X402.png",
    apple: "/X402.png",
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
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
