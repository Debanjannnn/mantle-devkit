"use client"

import { useReveal } from "@/hooks/use-reveal"
import { MagneticButton } from "@/components/magnetic-button"

export function PricingSection({ scrollToSection }: { scrollToSection?: (index: number) => void }) {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Pricing
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Open source. Free forever.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {[
            {
              title: "Open Source",
              price: "$0/month",
              features: [
                "Full x402 & Agent Kit access",
                "All protocol integrations",
                "Local Observatory dashboard",
                "Testnet support",
                "Community support",
              ],
              cta: "Get Started",
              highlight: false,
            },
            {
              title: "Observatory Cloud",
              price: "$29/month",
              subtitle: "Coming Soon",
              features: [
                "Hosted analytics dashboard",
                "30-day data retention",
                "Payment & DeFi alerts",
                "Team access",
                "Priority support",
              ],
              cta: "Notify Me",
              highlight: true,
            },
            {
              title: "Enterprise",
              price: "Custom",
              subtitle: "Coming Soon",
              features: [
                "Unlimited retention",
                "Custom protocol integrations",
                "SLA guarantee",
                "Dedicated support",
                "On-premise option",
              ],
              cta: "Contact Us",
              highlight: false,
            },
          ].map((tier, i) => (
            <div
              key={i}
              className={`group rounded-2xl border transition-all duration-700 ${
                tier.highlight
                  ? "border-foreground/30 bg-foreground/10 backdrop-blur-sm"
                  : "border-foreground/10 bg-foreground/5"
              } p-6 md:p-8 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="mb-4">
                <h3 className="mb-2 font-sans text-2xl font-light text-foreground md:text-3xl">{tier.title}</h3>
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-sans text-4xl font-light text-foreground md:text-5xl">{tier.price}</span>
                  {tier.subtitle && (
                    <span className="font-mono text-xs text-foreground/50">{tier.subtitle}</span>
                  )}
                </div>
              </div>

              <ul className="mb-6 space-y-3">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/40" />
                    <span className="font-mono text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <MagneticButton
                variant={tier.highlight ? "primary" : "secondary"}
                size="lg"
                className="w-full"
                onClick={() => scrollToSection?.(0)}
              >
                {tier.cta}
              </MagneticButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


