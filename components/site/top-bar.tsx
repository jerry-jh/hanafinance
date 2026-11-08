'use client'

import { motion, useTransform } from 'framer-motion'
import { useScrollTheme } from './scroll-theme'

const LINKS = [
  { href: '#demo', label: '시연' },
  { href: '#records', label: '거래 기록' },
]

export function TopBar() {
  const { dark } = useScrollTheme()
  const bg = useTransform(dark, [0, 1], ['rgba(255,255,255,0.92)', 'rgba(25,31,40,0.92)'])
  const line = useTransform(dark, [0, 1], ['#f2f4f6', '#333d4b'])
  const text = useTransform(dark, [0, 1], ['#191f28', '#ffffff'])
  const sub = useTransform(dark, [0, 1], ['#4e5968', '#b0b8c1'])

  return (
    <motion.header
      className="sticky top-0 z-40 h-[60px] border-b backdrop-blur"
      style={{ backgroundColor: bg, borderColor: line }}
    >
      <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between gap-4 px-5">
        <a href="#top" className="flex min-w-0 items-center gap-2">
          <motion.span className="truncate text-[17px] font-extrabold tracking-tight" style={{ color: text }}>
            하나금융TI × 인하대학교
          </motion.span>
          <motion.span
            className="hidden shrink-0 rounded-full border px-2.5 py-0.5 text-[13px] sm:inline"
            style={{ color: sub, borderColor: line }}
          >
            모의 시연
          </motion.span>
        </a>
        <nav aria-label="주요 메뉴" className="flex items-center gap-1">
          {LINKS.map((l) => (
            <motion.a
              key={l.href}
              href={l.href}
              style={{ color: sub }}
              className="shrink-0 rounded-lg px-3 py-2 text-[15px] font-medium hover:opacity-70"
            >
              {l.label}
            </motion.a>
          ))}
        </nav>
      </div>
    </motion.header>
  )
}
