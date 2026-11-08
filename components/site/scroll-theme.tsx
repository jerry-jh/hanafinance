'use client'

import { motion, transform, useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'

const WHITE = '#ffffff'
const SOFT = '#f9fafb'
const HALF = 150

type ScrollTheme = { bg: MotionValue<string>; dark: MotionValue<number> }

const ScrollThemeContext = createContext<ScrollTheme | null>(null)

export function useScrollTheme() {
  const ctx = useContext(ScrollThemeContext)
  if (!ctx) throw new Error('useScrollTheme must be used inside ScrollThemeProvider')
  return ctx
}

export function ScrollThemeProvider({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll()
  const bg = useMotionValue(WHITE)
  const dark = useMotionValue(0)
  const stops = useRef<number[] | null>(null)

  const update = useCallback(
    (y: number) => {
      const s = stops.current
      if (!s) return
      const [demo] = s
      bg.set(transform(y, [demo - HALF, demo + HALF], [WHITE, SOFT]) as string)
    },
    [bg],
  )

  useEffect(() => {
    const measure = () => {
      const mid = window.innerHeight / 2
      const tops = ['demo'].map((id) => {
        const el = document.getElementById(id)
        return el ? el.getBoundingClientRect().top + window.scrollY - mid : 0
      })
      stops.current = tops
      update(window.scrollY)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [update])

  useMotionValueEvent(scrollY, 'change', update)

  return (
    <ScrollThemeContext.Provider value={{ bg, dark }}>
      <motion.div aria-hidden="true" className="fixed inset-0 -z-10" style={{ backgroundColor: bg }} />
      {children}
    </ScrollThemeContext.Provider>
  )
}
