"use client"

import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"

export function FAQSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is x402?",
      answer:
        "x402 is an open protocol that enables HTTP-native payments. When a client requests a paid resource, the server returns HTTP 402 with payment requirements. The client pays and retries. Simple, stateless, and works with any HTTP client.",
    },
    {
      question: "Do I need to run my own facilitator?",
      answer:
        "No. x402 DevKit works with existing facilitators like Coinbase's or the community facilitator. You can run your own if you want full control.",
    },
    {
      question: "What wallets are supported?",
      answer: "Any EVM-compatible wallet works. We provide adapters for viem and ethers.js out of the box.",
    },
    {
      question: "How do I test without real money?",
      answer:
        "Use `x402 dev` to start the mock facilitator locally. It accepts all payments and tracks them in memory. Your tests run against real payment flows without touching the blockchain.",
    },
    {
      question: "Can I use this with Express?",
      answer:
        "Yes. While Hono is our primary target, we include an Express adapter. Import from `@x402-devkit/server/express`.",
    },
    {
      question: "What tokens can I accept?",
      answer:
        "On Mantle: MNT, USDC, mETH, and WMNT. The SDK handles token detection and verification automatically.",
    },
    {
      question: "How does Observatory work?",
      answer:
        "The SDK emits events (payment received, payment failed, etc.) to the Observatory ingest API. Observatory stores these, computes aggregations, and serves them to the dashboard. Self-host or use our cloud version.",
    },
    {
      question: "Is this production ready?",
      answer:
        "Yes. The core payment flow is battle-tested. Observatory and CLI are stable. Use in production with confidence.",
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


