"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "motion/react"

interface ScrollProgressProps {
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function ScrollProgress({ containerRef }: ScrollProgressProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!containerRef?.current) return

    const container = containerRef.current

    const updateProgress = () => {
      const scrollLeft = container.scrollLeft
      const scrollWidth = container.scrollWidth - container.clientWidth
      const newProgress = scrollWidth > 0 ? scrollLeft / scrollWidth : 0
      setProgress(newProgress)
      setIsVisible(newProgress > 0.01)
    }

    container.addEventListener("scroll", updateProgress, { passive: true })
    updateProgress() // Initial calculation

    return () => {
      container.removeEventListener("scroll", updateProgress)
    }
  }, [containerRef])

  const scaleX = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-0.5 origin-left bg-foreground/20"
      style={{ scaleX }}
    />
  )
}

