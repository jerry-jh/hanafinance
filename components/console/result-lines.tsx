'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check, Info, X } from 'lucide-react'
import type { SceneResult } from '@/lib/demos/types'

export function PayChip({
  label,
  size = 'md',
  tone = 'brand',
}: {
  label: string
  size?: 'md' | 'lg'
  tone?: 'brand' | 'danger'
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg ${tone === 'danger' ? 'bg-danger' : 'bg-brand'} font-bold text-white ${
        size === 'lg' ? 'px-3 py-1 text-xl' : 'px-2 py-0.5 text-[14px]'
      }`}
    >
      {label}
    </span>
  )
}

export function ResultLine({ result, animateChip = false }: { result: SceneResult; animateChip?: boolean }) {
  if (result.tone === 'reject') {
    return (
      <div className="flex items-start gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-[15px] text-ink" role="status">
        <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={3} />
        <p className="min-w-0 flex-1 leading-snug">
          <span className="font-semibold text-danger-text">{result.text.split(' · ')[0]}</span>
          {result.text.includes(' · ') && <span> · {result.text.split(' · ').slice(1).join(' · ')}</span>}
        </p>
      </div>
    )
  }
  if (result.tone === 'info') {
    return (
      <div className="flex items-start gap-2 rounded-2xl bg-soft px-4 py-3 text-[15px] text-ink-2" role="status">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
        <p className="leading-snug">{result.text}</p>
      </div>
    )
  }
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-brand-soft px-4 py-3 text-[15px]"
      role="status"
    >
      <span className="inline-flex items-center gap-1.5 font-semibold text-brand-text">
        <Check aria-hidden="true" className="size-4" strokeWidth={3} />
        {result.text}
      </span>
      {result.chip && (
        <>
          <ArrowRight aria-hidden="true" className="size-4 text-muted" />
          <motion.span
            initial={animateChip ? { scale: 0.9, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18, delay: animateChip ? 0.25 : 0 }}
          >
            <PayChip label={result.chip} size={animateChip ? 'lg' : 'md'} />
          </motion.span>
        </>
      )}
    </div>
  )
}
