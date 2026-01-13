import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PrivyProviderWrapper } from "@/components/privy-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mantle DevKit - Developer Suite for Mantle",
  description:
    "The complete developer suite for Mantle Network. x402 for API monetization, Agent Kit for DeFi integrations. Build on Mantle in minutes.",
  keywords: [
    "mantle",
    "mantle devkit",
    "MNT",
    "x402",
    "agent kit",
    "DeFi",
    "Mantle Network",
    "API monetization",
    "paid APIs",
    "micropayments",
    "blockchain payments",
    "web3 payments",
    "HTTP 402",
    "developer toolkit",
    "Mantle Sepolia",
    "MNT token",
    "DEX",
    "lending",
    "cross-chain",
  ],
  authors: [{ name: "Mantle DevKit" }],
  creator: "Mantle DevKit",
  publisher: "Mantle DevKit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mantle-devkit.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mantle DevKit - Developer Suite for Mantle",
    description:
      "The complete developer suite for Mantle Network. x402 for API monetization, Agent Kit for DeFi integrations.",
    url: "/",
    siteName: "Mantle DevKit",
    images: [
      {
        url: "/Mantle%20Devkit-thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Mantle DevKit - Developer Suite for Mantle",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mantle DevKit - Developer Suite for Mantle",
    description:
      "The complete developer suite for Mantle Network. x402 for API monetization, Agent Kit for DeFi integrations.",
    images: ["/Mantle%20Devkit-thumbnail.jpg"],
    creator: "@mantledevkit",
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
