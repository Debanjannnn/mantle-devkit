"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { MantleTestnet, MantleMainnet } from "@/lib/chains"

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    console.error("NEXT_PUBLIC_PRIVY_APP_ID is not set. Please add it to your .env.local file")
    return <>{children}</>
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["wallet", "email", "sms"],
        appearance: {
          theme: "light",
          accentColor: "#4A90E2",
          logo: "/favicon.ico",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: MantleTestnet,
        supportedChains: [MantleTestnet, MantleMainnet],
      }}
    >
      {children}
    </PrivyProvider>
  )
}


