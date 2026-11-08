'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

export function Disclosure({
  label,
  children,
  tone = 'light',
}: {
  label: string
  children: ReactNode
  tone?: 'light' | 'dark'
}) {
  const [open, setOpen] = useState(false)
  const toneClass =
    tone === 'dark' ? 'text-disabled hover:bg-ink-2 hover:text-white' : 'text-muted hover:bg-soft hover:text-ink-2'
  const id = useId()
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[15px] transition-colors ${toneClass}`}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full overflow-hidden"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
