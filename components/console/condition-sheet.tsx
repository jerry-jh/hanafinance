'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, Minus, X } from 'lucide-react'
import type { Scene, SceneCheck } from '@/lib/demos/types'
import { ResultLine } from './result-lines'

interface Props {
  open: boolean
  scene: Scene
  checks: SceneCheck[]
  step: number
  resolved: boolean
  onConfirm: () => void
}

function defaultDoneTitle(scene: Scene) {
  if (scene.doneTitle) return scene.doneTitle
  if (scene.kind === 'pass') return '가결됐어요'
  if (scene.kind === 'reject') return '보낼 수 없어요'
  return '보냈어요'
}

export function ConditionSheet({ open, scene, checks, step, resolved, onConfirm }: Props) {
  const results = scene.sheetResults ?? scene.results ?? []
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="absolute inset-0 z-20 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={resolved ? defaultDoneTitle(scene) : '조건을 확인하고 있어요'}
            className="absolute inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[620px] rounded-t-[28px] bg-white px-6 pt-3 pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <h3 className="text-[24px] font-extrabold tracking-tight text-ink" aria-live="polite">
              {resolved ? defaultDoneTitle(scene) : '조건을 확인하고 있어요'}
            </h3>
            <ul className="mt-4 flex flex-col">
              {checks.map((c, i) => {
                const visible = step >= i
                if (!visible) return null
                const pending = step === i
                return (
                  <motion.li
                    key={c.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 border-b border-line-soft py-3 last:border-b-0"
                  >
                    <CheckIcon pending={pending} ok={c.ok} />
                    <span className={`flex-1 text-[16px] ${c.ok === null && !pending ? 'text-muted' : 'text-ink'}`}>
                      {c.label}
                    </span>
                    {!pending && (
                      <span className="text-right font-mono text-[13px] text-muted">
                        {c.ok === null ? '확인 안 함' : c.code ?? (c.ok ? '통과' : '실패')}
                      </span>
                    )}
                    {pending && <span className="text-[13px] text-muted">확인 중</span>}
                  </motion.li>
                )
              })}
            </ul>
            <AnimatePresence>
              {resolved && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 flex flex-col gap-2"
                >
                  {results.map((r) => (
                    <ResultLine key={r.text} result={r} />
                  ))}
                  {scene.sheetBalance && (
                    <p className="text-center text-[16px] font-semibold text-ink tabular-nums">{scene.sheetBalance}</p>
                  )}
                  {scene.sheetNote && <p className="text-center font-mono text-[13px] text-muted">{scene.sheetNote}</p>}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!resolved}
              className="mt-5 h-14 w-full rounded-2xl bg-brand text-[17px] font-bold text-white transition-[transform,background-color] active:scale-[0.98] disabled:bg-soft disabled:text-muted"
            >
              확인
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CheckIcon({ pending, ok }: { pending: boolean; ok: boolean | null }) {
  if (pending) {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-soft">
        <Loader2 aria-hidden="true" className="size-4 animate-spin text-muted" />
        <span className="sr-only">확인 중</span>
      </span>
    )
  }
  if (ok === null) {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-soft">
        <Minus aria-hidden="true" className="size-3.5 text-muted" />
        <span className="sr-only">확인 안 함</span>
      </span>
    )
  }
  return ok ? (
    <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft">
      <Check aria-hidden="true" className="size-3.5 text-brand" strokeWidth={3} />
      <span className="sr-only">통과</span>
    </span>
  ) : (
    <span className="flex size-6 items-center justify-center rounded-full bg-danger-soft">
      <X aria-hidden="true" className="size-3.5 text-danger" strokeWidth={3} />
      <span className="sr-only">실패</span>
    </span>
  )
}
