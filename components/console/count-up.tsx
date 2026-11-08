'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { num } from '@/lib/format'

export function CountUp({
  value,
  from,
  duration = 700,
  className,
}: {
  value: number
  from?: number
  duration?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(from ?? value)
  const shownRef = useRef(from ?? value)

  useEffect(() => {
    const start = shownRef.current
    if (reduced || start === value) {
      shownRef.current = value
      setDisplay(value)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = start + (value - start) * eased
      shownRef.current = v
      setDisplay(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, reduced])

  return <span className={`tabular-nums ${className ?? ''}`}>{num(display)}</span>
}
