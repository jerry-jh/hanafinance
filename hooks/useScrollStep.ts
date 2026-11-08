'use client'

import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { useRef, useState } from 'react'

export function useScrollStep(count: number) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setStep(Math.min(count - 1, Math.max(0, Math.floor(p * count))))
  })

  return { ref, step: reduce ? count - 1 : step, reduce: !!reduce }
}
