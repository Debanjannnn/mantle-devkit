"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, ChevronDown, Play } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"
import { PaymentModal } from "@/components/payment-modal"

const X402_COMPONENTS = [
  {
    name: "Server Middleware",
    description: "Express/Hono middleware for payment-gated endpoints",
    code: `import { x402 } from 'x402-mantle-sdk/server'

app.use('/api/premium', x402({
  price: '0.001',
  token: 'MNT',
  testnet: true
}))`,
  },
  {
    name: "Client Fetch",
    description: "Make paid requests with automatic payment handling",
    code: `import { x402Fetch } from 'x402-mantle-sdk/client'

const response = await x402Fetch(
  'https://api.example.com/premium'
)`,
  },
  {
    name: "React Hook",
    description: "React hook for payment state management",
    code: `import { useX402 } from 'x402-mantle-sdk/client/react'

const { pay, isPaying, error } = useX402()

await pay({
  endpoint: '/api/premium',
  price: '0.001',
  token: 'MNT'
})`,
  },
]

const PAYMENT_MODAL_COMPONENT = {
  name: "PaymentModal",
  description: "React component for handling x402 payments with wallet integration",
  import: "import { PaymentModal } from 'x402-mantle-sdk/client/react'",
  code: `import { PaymentModal } from 'x402-mantle-sdk/client/react'

function MyComponent() {
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const handlePayment = async () => {
    // Trigger payment request (e.g., from API 402 response)
    setPaymentRequest({
      amount: "0.001",
      token: "MNT",
      network: "mantle",
      recipient: "0xB27705342ACE73736AE490540Ea031cc06C3eF49"
    })
    setIsOpen(true)
  }

  return (
    <>
      <button onClick={handlePayment}>Pay for API</button>
      <PaymentModal
        request={paymentRequest}
        isOpen={isOpen}
        onComplete={(payment) => {
          console.log('Payment completed:', payment.transactionHash)
          setIsOpen(false)
        }}
        onCancel={() => setIsOpen(false)}
      />
    </>
  )
}`,
  props: [
    { name: "request", type: "PaymentRequest", required: true, description: "Payment request object with amount, token, network, and recipient" },
    { name: "isOpen", type: "boolean", required: true, description: "Controls modal visibility" },
    { name: "onComplete", type: "(payment: PaymentResponse) => void", required: true, description: "Callback when payment is completed" },
    { name: "onCancel", type: "() => void", required: true, description: "Callback when user cancels payment" },
  ],
}

function CodeBlock({ code, onCopy }: { code: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy()
  }

  return (
    <div className="my-4 flex rounded-lg border border-foreground/10 bg-foreground/10 overflow-hidden">
      <pre className="flex-1 overflow-x-auto p-4">
        <code className="font-mono text-xs text-foreground/90">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center px-3 text-foreground/50 transition-colors hover:text-foreground"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

export function X402Tab() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleCopy = async (code: string, name: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(name)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <>
      {/* Header */}
      <BlurFade delay={0} direction="up">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl">
              x402 Components
            </h2>
            <p className="font-mono text-sm text-foreground/60">/ Payment SDK for Mantle</p>
          </div>
          <a
            href="https://www.npmjs.com/package/x402-mantle-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
          >
            <ExternalLink className="h-4 w-4" />
            npm
          </a>
        </div>
      </BlurFade>

      <div className="space-y-4">
        {/* PaymentModal Component with Preview */}
        <BlurFade delay={0.1} direction="up">
          <MagicCard
            gradientSize={300}
            gradientFrom="oklch(0.35 0.15 240)"
            gradientTo="oklch(0.3 0.13 240)"
            gradientColor="oklch(0.35 0.15 240)"
            gradientOpacity={0.15}
            className="rounded-2xl"
          >
            <div className="rounded-2xl border border-foreground/20 bg-foreground/5 p-8 backdrop-blur-xl">
              {/* Header with Preview Button */}
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-8 bg-foreground/30" />
                <span className="font-mono text-xs text-foreground/60">01</span>
              </div>

              <h3 className="mb-2 font-sans text-xl font-light text-foreground md:text-2xl">
                {PAYMENT_MODAL_COMPONENT.name}
              </h3>

              <div className="mb-6 flex items-start justify-between gap-4">
                <p className="font-sans text-base text-foreground/70 flex-1">{PAYMENT_MODAL_COMPONENT.description}</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/15 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/20 flex-shrink-0"
                >
                  <Play className="h-4 w-4" />
                  Preview
                </button>
              </div>

              <div className="mb-6">
                <div className="mb-4">
                  <p className="font-mono text-xs text-foreground/60 mb-2">Import</p>
                  <CodeBlock code={PAYMENT_MODAL_COMPONENT.import} onCopy={() => setCopiedCode("import")} />
                </div>
                <div className="mb-4">
                  <p className="font-mono text-xs text-foreground/60 mb-2">Usage Example</p>
                  <CodeBlock code={PAYMENT_MODAL_COMPONENT.code} onCopy={() => setCopiedCode("code")} />
                </div>
                <div className="mb-4">
                  <p className="font-mono text-xs text-foreground/60 mb-2">Props</p>
                  <div className="space-y-2">
                    {PAYMENT_MODAL_COMPONENT.props.map((prop, idx) => (
                      <div key={idx} className="rounded-lg border border-foreground/10 bg-foreground/5 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="font-mono text-xs text-foreground">{prop.name}</code>
                          <span className="font-mono text-xs text-foreground/50">({prop.type})</span>
                          {prop.required && (
                            <span className="font-mono text-xs text-red-500/80">required</span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-foreground/60">{prop.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        {/* Other Components */}
        {X402_COMPONENTS.map((component, index) => (
          <BlurFade key={component.name} delay={0.1 * (index + 2)} direction="left">
            <MagicCard
              gradientSize={200}
              gradientFrom="oklch(0.35 0.15 240)"
              gradientTo="oklch(0.3 0.13 240)"
              gradientColor="oklch(0.35 0.15 240)"
              gradientOpacity={0.1}
              className="rounded-xl"
            >
              <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px w-8 bg-foreground/30" />
                  <span className="font-mono text-xs text-foreground/60">0{index + 2}</span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 font-sans text-xl font-light text-foreground md:text-2xl">
                      {component.name}
                    </h3>
                    <p className="font-mono text-sm text-foreground/70">{component.description}</p>
                  </div>
                  <button
                    onClick={() => setExpandedCard(expandedCard === component.name ? null : component.name)}
                    className="rounded-lg border border-foreground/20 bg-foreground/10 p-2 text-foreground/60 transition-colors hover:bg-foreground/15 hover:text-foreground"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedCard === component.name ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: expandedCard === component.name ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="pt-4">
                      <div className="relative">
                        <pre className="rounded-lg border border-foreground/10 bg-background p-4 font-mono text-sm text-foreground overflow-x-auto">
                          {component.code}
                        </pre>
                        <button
                          onClick={() => handleCopy(component.code, component.name)}
                          className="absolute right-2 top-2 flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-1.5 font-mono text-xs text-foreground/60 transition-colors hover:bg-foreground/15 hover:text-foreground"
                        >
                          {copiedCode === component.name ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedCode === component.name ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MagicCard>
          </BlurFade>
        ))}

      </div>

      {/* Payment Modal Preview */}
      <PaymentModal
        isOpen={showModal}
        simulation={true}
        request={{
          amount: "0.001",
          token: "MNT",
          network: "mantle",
          recipient: "0xB27705342ACE73736AE490540Ea031cc06C3eF49",
          description: "Preview payment modal (Simulation)",
          endpoint: "/api/premium-data",
        }}
        onComplete={(payment) => {
          console.log("Simulated payment completed:", payment.transactionHash)
          setTimeout(() => {
            setShowModal(false)
          }, 3000)
        }}
        onCancel={() => setShowModal(false)}
      />
    </>
  )
}
