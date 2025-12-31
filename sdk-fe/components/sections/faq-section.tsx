"use client"

import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"

export function FAQSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is Mantle DevKit?",
      answer:
        "Mantle DevKit is a complete developer toolkit containing two SDKs: x402-mantle-sdk for API monetization with HTTP 402 payments, and mantle-agent-kit-sdk for DeFi protocol integrations including swaps, lending, and cross-chain operations.",
    },
    {
      question: "What is x402?",
      answer:
        "x402 is an open protocol that enables HTTP-native payments. When a client requests a paid resource, the server returns HTTP 402 with payment requirements. The client pays and retries. Simple, stateless, and works with any HTTP client.",
    },
    {
      question: "What protocols does Agent Kit support?",
      answer:
        "Agent Kit integrates with DEX aggregators (OKX, 1inch, OpenOcean), native DEXs (Agni Finance, Merchant Moe, Uniswap V3), Lendle for lending, mETH for liquid staking, and Squid Router for cross-chain operations.",
    },
    {
      question: "What wallets are supported?",
      answer: "Any EVM-compatible wallet works. Both SDKs use Viem for blockchain interactions. x402 provides React payment modals, while Agent Kit works with private keys for server-side operations.",
    },
    {
      question: "How do I test without real money?",
      answer:
        "For x402, use the mock facilitator locally. For Agent Kit, deploy to Mantle Sepolia testnet (chain ID 5003) for testing swaps, lending, and other DeFi operations.",
    },
    {
      question: "What tokens can I use?",
      answer:
        "On Mantle: MNT, USDC, USDT, mETH, and WMNT. Both SDKs handle token detection and operations automatically. Agent Kit also supports any token listed on integrated DEXs.",
    },
    {
      question: "Can I use Agent Kit for AI agents?",
      answer:
        "Absolutely. Agent Kit is designed for programmatic DeFi operations. Combine it with x402 to let your AI agents both pay for and monetize APIs while executing DeFi strategies.",
    },
    {
      question: "Is this production ready?",
      answer:
        "Yes. Both SDKs are production-ready. x402 handles payment flows reliably, and Agent Kit integrates with verified, production contracts on Mantle mainnet.",
    },
  ]

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            FAQ
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Common questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`group border-b border-foreground/10 transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-foreground/90"
              >
                <h3 className="font-sans text-lg font-light text-foreground md:text-xl">{faq.question}</h3>
                <span className="ml-4 font-mono text-2xl text-foreground/40 transition-transform duration-300 group-hover:text-foreground/60">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="pb-4 font-mono text-sm leading-relaxed text-foreground/80 md:text-base">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


