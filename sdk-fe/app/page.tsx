"use client"
import { GrainOverlay } from "@/components/grain-overlay"
import { WorkSection } from "@/components/sections/work-section"
import { ServicesSection } from "@/components/sections/services-section"
import { AboutSection } from "@/components/sections/about-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { FAQSection } from "@/components/sections/faq-section"
import { MagneticButton } from "@/components/magnetic-button"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { MagicCard } from "@/components/ui/magic-card"
import { BlurFade } from "@/components/ui/blur-fade"
import { useRef, useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number | undefined>(undefined)
  const scrollCooldownRef = useRef<NodeJS.Timeout | null>(null)
  const { ready, authenticated, login, user } = usePrivy()
  const router = useRouter()

  // Auto-redirect to dashboard if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/dashboard")
    }
  }, [ready, authenticated, router])

  // Listen for successful login and switch to Mantle network
  useEffect(() => {
    if (ready && authenticated && user) {
      // Switch to Mantle network
      const switchToMantle = async () => {
        try {
          if (typeof window !== "undefined" && (window as any).ethereum) {
            const chainId = "0x138B" // 5003 in hex for Mantle Sepolia Testnet
            const ethereum = (window as any).ethereum
            try {
              await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId }],
              })
            } catch (switchError: any) {
              // This error code indicates that the chain has not been added to MetaMask
              if (switchError.code === 4902) {
                try {
                  await ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId: "0x138B",
                        chainName: "Mantle Sepolia Testnet",
                        nativeCurrency: {
                          name: "MNT",
                          symbol: "MNT",
                          decimals: 18,
                        },
                        rpcUrls: ["https://mantle-sepolia.drpc.org"],
                        blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"],
                      },
                    ],
                  })
                } catch (addError) {
                  console.error("Failed to add Mantle network:", addError)
                }
              } else {
                console.error("Failed to switch to Mantle network:", switchError)
              }
            }
          }
        } catch (error) {
          console.error("Error switching network:", error)
        }
      }

      switchToMantle()

      // Small delay to ensure wallet connection is complete
      const timer = setTimeout(() => {
        router.replace("/dashboard")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [ready, authenticated, user, router])

  const handleGetStarted = async () => {
    if (!ready) {
      console.log("Privy is not ready yet")
      return
    }

    if (authenticated) {
      router.replace("/dashboard")
    } else {
      try {
        await login()
        // Redirect will happen via useEffect after successful login
      } catch (error) {
        console.error("Failed to connect wallet:", error)
      }
    }
  }

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      } else {
        // No shader container, load immediately
        setIsLoaded(true)
        return true
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 50)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 200)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const scrollToSection = (index: number, force: boolean = false) => {
    if (!scrollContainerRef.current) return
    if (isScrolling && !force) return

    const totalSections = 6
    const clampedIndex = Math.max(0, Math.min(index, totalSections - 1))

    // For wheel/touch, skip if same section; for nav clicks (force), always scroll
    if (!force && clampedIndex === currentSection) return

    setIsScrolling(true)
    const sectionWidth = scrollContainerRef.current.offsetWidth
    scrollContainerRef.current.scrollTo({
      left: sectionWidth * clampedIndex,
      behavior: "smooth",
    })
    setCurrentSection(clampedIndex)

    // Reset scrolling state after animation completes
    if (scrollCooldownRef.current) {
      clearTimeout(scrollCooldownRef.current)
    }
    scrollCooldownRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 800)
  }

  // Cleanup cooldown timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollCooldownRef.current) {
        clearTimeout(scrollCooldownRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return

      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      const totalSections = 6
      const swipeThreshold = 50

      // Support both vertical and horizontal swipes
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
        if (deltaY > 0 && currentSection < totalSections - 1) {
          scrollToSection(currentSection + 1)
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      } else if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && currentSection < totalSections - 1) {
          scrollToSection(currentSection + 1)
        } else if (deltaX < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentSection, isScrolling])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (isScrolling || !scrollContainerRef.current) return

      const totalSections = 6
      const threshold = 30 // Minimum scroll delta to trigger section change

      // Determine scroll direction (support both vertical and horizontal wheel)
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX

      if (Math.abs(delta) < threshold) return

      if (delta > 0 && currentSection < totalSections - 1) {
        // Scroll down/right - go to next section
        scrollToSection(currentSection + 1)
      } else if (delta < 0 && currentSection > 0) {
        // Scroll up/left - go to previous section
        scrollToSection(currentSection - 1)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentSection, isScrolling])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= 5) {
          setCurrentSection(newSection)
        }

        scrollThrottleRef.current = undefined
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection])

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Mantle DevKit",
    applicationCategory: "DeveloperApplication",
    description:
      "The complete developer toolkit for building on Mantle. x402 API monetization and DeFi Agent Kit for seamless protocol integrations.",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
    },
    featureList: [
      "x402 API Monetization",
      "DeFi Agent Kit",
      "DEX Aggregators Integration",
      "Lending Protocol Support",
      "Cross-Chain Operations",
      "Real-time Dashboard",
    ],
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GrainOverlay />
      <ScrollProgress containerRef={scrollContainerRef} />

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-300 md:px-12 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => scrollToSection(0, true)}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
            <img src="/X402.png" alt="Mantle DevKit" className="h-full w-full object-contain" />
          </div>
          <span className="font-sans text-sm font-semibold tracking-tight text-foreground">Mantle DevKit</span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {["Home", "Features", "Use Cases", "Why Mantle", "Pricing", "FAQ"].map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(index, true)}
              className={`group relative font-sans text-sm font-medium transition-colors ${
                currentSection === index ? "text-foreground" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                  currentSection === index ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {ready && authenticated ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
            >
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Dashboard</span>
            </button>
          ) : (
            <MagneticButton variant="secondary" onClick={handleGetStarted}>
              {ready ? "Connect Wallet" : "Loading..."}
            </MagneticButton>
          )}
        </div>
      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen snap-x snap-mandatory overflow-x-auto overflow-y-hidden transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "smooth" }}
      >
        {/* Hero Section */}
        <section className="relative flex min-h-screen w-screen shrink-0 snap-start flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24 lg:flex-row lg:items-end lg:gap-12">
          {/* Left Section - Text Content */}
          <div className="max-w-3xl lg:flex-1 lg:mr-32">
            <BlurFade delay={0} direction="up" offset={10} blur="4px">
              <div className="mb-4 inline-block w-fit rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md">
                <p className="font-mono text-xs text-foreground/90">Built for Mantle Network</p>
              </div>
            </BlurFade>
            <BlurFade delay={0.2} direction="up" offset={20} blur="6px">
              <h1 className="mb-6 font-sans text-6xl font-light leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl">
              <span className="text-balance">
                Payments and DeFi
                <br />
                with a Few Lines of Code
              </span>
              </h1>
            </BlurFade>
            <BlurFade delay={0.3} direction="up" offset={15} blur="4px">
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-foreground/90 md:text-xl">
              <span className="text-pretty">
                The first complete developer toolkit for Mantle. Accept payments on any API with x402. Swap, lend, stake, and bridge with Agent Kit. Ship in minutes.
              </span>
              </p>
            </BlurFade>
            <BlurFade delay={0.4} direction="up" offset={10} blur="4px">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <MagneticButton size="lg" variant="primary" onClick={handleGetStarted}>
                Get Started →
              </MagneticButton>
              <MagneticButton size="lg" variant="secondary" onClick={() => scrollToSection(1, true)}>
                View Documentation
              </MagneticButton>
              </div>
            </BlurFade>
          </div>

          {/* Right Section - Code Example */}
          <div className="mt-12 flex-1 lg:mt-0 lg:max-w-xl">
            <BlurFade delay={0.4} direction="right" offset={20} blur="8px">
              <MagicCard
                gradientSize={300}
                gradientFrom="oklch(0.35 0.15 240)"
                gradientTo="oklch(0.3 0.13 240)"
                gradientColor="oklch(0.35 0.15 240)"
                gradientOpacity={0.15}
                className="rounded-2xl"
              >
                <div className="rounded-2xl border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-xl md:p-8">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-foreground/30" />
                    <div className="h-3 w-3 rounded-full bg-foreground/30" />
                    <div className="h-3 w-3 rounded-full bg-foreground/30" />
                  </div>
                  <span className="ml-2 font-mono text-xs text-foreground/60">server.ts</span>
                </div>
                <div className="space-y-3 font-mono text-sm leading-relaxed">
                  <div className="flex items-start gap-3">
                    <span className="text-foreground/40">1</span>
                    <code className="text-foreground/90">
                      <span className="text-foreground/60">// x402 - API Monetization</span>
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-foreground/40">2</span>
                    <code className="text-foreground/90">
                      <span className="text-foreground">app</span>
                      <span className="text-foreground/60">.</span>
                      <span className="text-foreground">use</span>
                      <span className="text-foreground/60">(</span>
                      <span className="text-foreground">x402</span>
                      <span className="text-foreground/60">({`{ price: "0.001", token: "USDC" }`})</span>
                      <span className="text-foreground/60">)</span>
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-foreground/40">3</span>
                    <code className="text-foreground/90">
                      <span className="text-foreground/60"> </span>
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-foreground/40">4</span>
                    <code className="text-foreground/90">
                      <span className="text-foreground/60">// Agent Kit - DeFi Integration</span>
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-foreground/40">5</span>
                    <code className="text-foreground/90">
                      <span className="text-foreground/60">const </span>
                      <span className="text-foreground">agent</span>
                      <span className="text-foreground/60"> = </span>
                      <span className="text-foreground/60">new </span>
                      <span className="text-foreground">MNTAgentKit</span>
                      <span className="text-foreground/60">(key, </span>
                      <span className="text-foreground">"mainnet"</span>
                      <span className="text-foreground/60">)</span>
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-foreground/40">6</span>
                    <code className="text-foreground/90">
                      <span className="text-foreground/60">await </span>
                      <span className="text-foreground">agent</span>
                      <span className="text-foreground/60">.</span>
                      <span className="text-foreground">agniSwap</span>
                      <span className="text-foreground/60">(tokenIn, tokenOut, amount)</span>
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-foreground/40">7</span>
                    <code className="text-foreground/90">
                      <span className="text-foreground/60">await </span>
                      <span className="text-foreground">agent</span>
                      <span className="text-foreground/60">.</span>
                      <span className="text-foreground">lendleSupply</span>
                      <span className="text-foreground/60">(token, amount)</span>
                    </code>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
                  <div className="flex h-2 w-2 items-center justify-center">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/60" />
                  </div>
                  <p className="font-mono text-xs text-foreground/70">Payments + DeFi in minutes.</p>
                </div>
                </div>
              </MagicCard>
            </BlurFade>
          </div>

          {/* Scroll Indicator - Bottom Center */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-foreground/80">Scroll to explore</p>
              <div className="flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
                <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/80" />
              </div>
            </div>
          </div>
        </section>

        <WorkSection />
        <ServicesSection />
        <AboutSection scrollToSection={scrollToSection} />
        <PricingSection scrollToSection={scrollToSection} />
        <FAQSection />
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}
