"use client"

import { useMemo } from "react"
import { PrivyProvider } from "@privy-io/react-auth"
import { MantleTestnet, MantleMainnet } from "@/lib/chains"

// Stable array references to avoid React key warnings
const LOGIN_METHODS = ["wallet", "email", "sms"] as const
const SUPPORTED_CHAINS = [MantleTestnet, MantleMainnet]

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  // Memoize config to ensure stable references
  const config = useMemo(
    () => ({
      loginMethods: LOGIN_METHODS,
      appearance: {
        theme: "light" as const,
        accentColor: "#4A90E2",
        logo: "/favicon.ico",
      },
      embeddedWallets: {
        ethereum: {
          createOnLogin: "users-without-wallets" as const,
        },
      },
      defaultChain: MantleTestnet,
      supportedChains: SUPPORTED_CHAINS,
    }),
    []
  )

  if (!appId) {
    console.error("NEXT_PUBLIC_PRIVY_APP_ID is not set. Please add it to your .env.local file")
    return <>{children}</>
  }

  return (
    <PrivyProvider appId={appId} config={config}>
      {children}
    </PrivyProvider>
  )
}


