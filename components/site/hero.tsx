'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const buttonOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])

  return (
    <section
      ref={ref}
      id="top"
      className="flex min-h-[calc(100svh-60px)] items-center justify-center px-5 py-24"
    >
      <motion.div
        style={reduce ? undefined : { scale: titleScale, opacity: titleOpacity }}
        className="mx-auto flex max-w-[1180px] flex-col items-center text-center"
      >
        <h1 className="text-[52px] leading-[1.05] font-extrabold tracking-[-0.035em] text-ink sm:text-[80px] lg:text-[100px]">
          모의 예금토큰
          <br />
          조건부 지급 시연
        </h1>
        <motion.a
          href="#demo"
          style={reduce ? undefined : { opacity: buttonOpacity }}
          className="mt-16 inline-flex h-14 items-center rounded-2xl bg-brand px-8 text-[17px] font-bold text-white transition-transform active:scale-[0.98]"
        >
          시작하기
        </motion.a>
      </motion.div>
    </section>
  )
}
