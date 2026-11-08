'use client'

import { useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

/** Reveals `count` items one by one while `active`; otherwise reports all revealed. */
export function useStagger(count: number, active: boolean, interval: number, startDelay = 0) {
  const reduced = useReducedMotion()
  const animate = active && !reduced
  const [revealed, setRevealed] = useState(animate ? 0 : count)

  useEffect(() => {
    if (!animate) {
      setRevealed(count)
      return
    }
    setRevealed(0)
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => setRevealed(i + 1), startDelay + interval * i),
    )
    return () => timers.forEach(clearTimeout)
  }, [animate, count, interval, startDelay])

  return revealed
}
