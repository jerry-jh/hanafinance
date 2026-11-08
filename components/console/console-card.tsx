'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, Import, MousePointer2, Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { DemoPlayer } from '@/hooks/useDemoPlayer'
import type { Demo } from '@/lib/demos/types'
import { ConditionSheet } from './condition-sheet'
import { ResultLine } from './result-lines'
import { SceneVisual } from './scene-visual'

interface Props {
  demo: Demo
  caseId: string
  onCaseChange: (id: string) => void
  player: DemoPlayer
}

export function ConsoleCard({ demo, caseId, onCaseChange, player }: Props) {
  const { scene, scenes, index, phase, mode, playing, pressing, isLast } = player
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }, [])
  // revealDelayMs가 있는 단계는 화면 애니메이션이 끝난 뒤에 결과 줄·반짝임을 보여줘요
  const revealKey = scene ? `${caseId}-${scene.id}` : ''
  const revealDelay = scene?.revealDelayMs ?? 0
  const [revealedKey, setRevealedKey] = useState('')
  useEffect(() => {
    if (phase !== 'done' || !revealDelay) {
      setRevealedKey('')
      return
    }
    const t = setTimeout(() => setRevealedKey(revealKey), revealDelay)
    return () => clearTimeout(t)
  }, [phase, revealKey, revealDelay])
  if (!scene || !player.prevState || !player.nextState) return null

  const done = phase === 'done'
  // 미유올은 외부 정산 데이터를 끌어오는 역할이라 배지 색과 아이콘을 따로 줘요
  const isMiyuol = scene.role.includes('미유올')
  // 하나은행 배지는 아래 초록 버튼과 같은 색
  const isHana = scene.role.startsWith('하나은행')
  const revealed = done && (!revealDelay || revealedKey === revealKey)
  const progress = (index + (done ? 1 : 0)) / scenes.length
  const primaryLabel = done ? '다음 단계' : scene.actionLabel
  const showCursor = mode === 'auto' && playing && phase === 'ready'
  const paused = mode === 'auto' && !playing

  const onEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setHovered(true)
  }
  const onLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => setHovered(false), 2000)
  }

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative flex min-h-[580px] flex-col overflow-hidden rounded-3xl border border-line-soft bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    >
      <div
        className="relative h-1 w-full bg-line-soft"
        role="progressbar"
        aria-label="시연 진행"
        aria-valuemin={0}
        aria-valuemax={scenes.length}
        aria-valuenow={index + (done ? 1 : 0)}
      >
        <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${progress * 100}%` }} />
        {scenes.map((s, i) =>
          s.kind === 'reject' && (i < index || (i === index && done)) ? (
            <span
              key={s.id}
              aria-hidden="true"
              className="absolute top-0 h-full w-1.5 bg-danger"
              style={{ left: `calc(${((i + 1) / scenes.length) * 100}% - 6px)` }}
            />
          ) : null,
        )}
      </div>

      <AnimatePresence>
        {revealed && scene.flash && (
          <motion.div
            key={`flash-${scene.id}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-brand-soft"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, times: [0, 0.33, 1] }}
          />
        )}
      </AnimatePresence>

      {revealed && scene.stamp && (
        <motion.div
          key={`stamp-${scene.id}`}
          role="status"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.6, times: [0, 0.15, 0.75, 1] }}
        >
          <motion.span
            initial={reduced ? false : { scale: 1.6, rotate: -8 }}
            animate={{ scale: 1, rotate: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 16 }}
            className="inline-flex items-center gap-2 rounded-2xl border-4 border-brand bg-white/90 px-6 py-3 text-[30px] font-extrabold tracking-tight text-brand-text shadow-[0_8px_24px_rgba(18,161,80,0.25)]"
          >
            <Check aria-hidden="true" className="size-8" strokeWidth={3.5} />
            {scene.stamp}
          </motion.span>
        </motion.div>
      )}

      <div className="relative z-10 flex flex-1 flex-col px-6 pt-5 pb-5 sm:px-7">
        <div className="flex min-h-[36px] items-center justify-between gap-3">
          {demo.cases ? (
            <label className="relative inline-flex shrink-0 items-center">
              <span className="sr-only">사례 선택</span>
              <select
                value={caseId}
                onChange={(e) => onCaseChange(e.target.value)}
                className="appearance-none rounded-full bg-transparent py-1 pr-6 pl-2 text-[14px] text-muted hover:bg-soft focus-visible:outline-2"
              >
                {demo.cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label.split(' · ')[0]}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-1 size-4 text-muted" />
            </label>
          ) : (
            <span />
          )}
          <span
            className={`inline-flex min-w-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-white ${
              scene.role === '조건 미충족 시' ? 'bg-danger' : isMiyuol ? '' : isHana ? 'bg-brand' : 'bg-ink'
            }`}
            style={isMiyuol ? { background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', color: '#0369a1' } : undefined}
          >
            {isMiyuol && <Import aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.5} />}
            <span className="truncate text-[15px] font-bold">{scene.role}</span>
          </span>
        </div>

        <AutoHeight>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${caseId}-${scene.id}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5 pt-3"
            >
              <h3
                className={`${scene.short.includes('\n') ? 'whitespace-pre-line' : 'truncate'} text-[26px] leading-tight font-extrabold tracking-tight text-ink sm:text-[30px]`}
              >
                {scene.short}
              </h3>
              <SceneVisual demo={demo} scene={scene} prev={player.prevState} next={player.nextState} phase={phase} />
              {revealed && scene.results && scene.results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2"
                >
                  {scene.results.map((r) => (
                    <ResultLine key={r.text} result={r} animateChip={Boolean(scene.flash)} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </AutoHeight>

        <div className={`relative mt-auto pt-5 ${done && isLast ? 'invisible' : ''}`} aria-hidden={done && isLast}>
          <button
            type="button"
            onClick={player.primary}
            disabled={phase === 'running'}
            className={`h-14 w-full rounded-2xl bg-brand text-[17px] font-bold text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-60 ${
              pressing ? 'scale-[0.98]' : ''
            }`}
          >
            {primaryLabel}
          </button>
          {showCursor && <FakeCursor key={`cursor-${scene.id}`} />}
        </div>

        <div className="mt-4 flex h-9 items-center justify-end">
          <span className="text-[12px] text-[#B0B8C1] tabular-nums">
            {index + 1} / {scenes.length}
          </span>
        </div>
      </div>

      {playing && (
        <button
          type="button"
          onClick={player.pause}
          aria-label="자동 재생 일시정지"
          className={`absolute bottom-5 left-6 z-20 flex size-9 items-center justify-center rounded-full bg-soft text-ink-2 transition-opacity duration-150 hover:bg-line focus-visible:pointer-events-auto focus-visible:opacity-100 sm:left-7 ${
            hovered ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Pause aria-hidden="true" className="size-4" fill="currentColor" />
        </button>
      )}

      {paused && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <button
            type="button"
            onClick={player.play}
            aria-label="자동 재생 계속"
            className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-transform duration-150 hover:scale-105"
          >
            <Play aria-hidden="true" className="ml-0.5 size-4" fill="currentColor" />
          </button>
        </div>
      )}

      <ConditionSheet
        open={player.sheetOpen}
        scene={scene}
        checks={player.checks}
        step={player.sheetStep}
        resolved={player.sheetResolved}
        onConfirm={player.closeSheet}
      />
    </div>
  )
}

function FakeCursor() {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 z-20"
      initial={{ x: 160, y: 70, opacity: 0 }}
      animate={{ x: 4, y: 2, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5, ease: 'easeInOut' }}
    >
      <MousePointer2 className="size-6 text-ink drop-shadow" fill="#191F28" stroke="#ffffff" strokeWidth={1.5} />
    </motion.span>
  )
}

function AutoHeight({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <motion.div animate={{ height }} transition={{ duration: 0.25, ease: 'easeOut' }} className="overflow-hidden">
      <div ref={ref}>{children}</div>
    </motion.div>
  )
}
