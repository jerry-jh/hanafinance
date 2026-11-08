'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Lock, RotateCcw } from 'lucide-react'
import { MONTHS, PREPAID, type DemoBState, type DemoBVisual, type MonthKey, type SlotStatus } from '@/lib/demos/demo-b'
import { num } from '@/lib/format'
import type { Phase } from '@/hooks/useDemoPlayer'
import { CountUp } from '../count-up'
import { PayChip } from '../result-lines'
import { useStagger } from './use-stagger'

interface Props {
  visual: DemoBVisual
  prev: DemoBState
  next: DemoBState
  phase: Phase
}

export function DemoBVisualView({ visual, prev, next, phase }: Props) {
  const done = phase === 'done'
  const state = done ? next : prev

  if (visual.type === 'calc') {
    return (
      <div className="flex flex-col gap-4">
        <PrepaidStrip />
        <SlotRow slots={state.slots} prevSlots={prev.slots} done={false} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SlotRow slots={state.slots} prevSlots={prev.slots} done={done} flashReject={done ? visual.flashReject : undefined} />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col rounded-2xl bg-soft px-4 py-3">
          <span className="text-[14px] text-muted">잠긴 잔액</span>
          <span className="text-[34px] leading-tight font-extrabold tracking-tight text-ink">
            <CountUp value={state.locked} />
            <span className="ml-1 text-lg font-semibold text-muted">원</span>
          </span>
        </div>
        {visual.refund !== undefined ? (
          <div className="flex flex-col rounded-2xl bg-soft px-4 py-3">
            <span className="flex items-center justify-between gap-2 text-[14px] text-muted">
              예약자 환불
              <PayChip label="예약자에게 환불금 지급" tone="danger" />
            </span>
            <span
              className={`text-[34px] leading-tight font-extrabold tracking-tight ${done ? 'text-danger-text' : 'text-ink'}`}
            >
              {done ? '+' : ''}
              <CountUp value={done ? visual.refund : 0} />
              <span className="ml-1 text-lg font-semibold text-muted">원</span>
            </span>
          </div>
        ) : (
          <div className="flex flex-col rounded-2xl bg-soft px-4 py-3">
            <span className="flex items-center justify-between gap-2 text-[14px] text-muted">
              청소 업체 입금
              <PayChip label="청소비 지급" />
            </span>
            <span
              className={`text-[34px] leading-tight font-extrabold tracking-tight ${
                state.cleaner > 0 ? 'text-brand-text' : 'text-ink'
              }`}
            >
              {state.cleaner > 0 ? '+' : ''}
              <CountUp value={state.cleaner} />
              <span className="ml-1 text-lg font-semibold text-muted">원</span>
            </span>
          </div>
        )}
      </div>
      {visual.note && <p className="text-[13px] leading-relaxed text-muted">{visual.note}</p>}
    </div>
  )
}

function PrepaidStrip() {
  const steps = [
    { label: '선결제', value: num(PREPAID.payment) },
    { label: 'PG 수수료 3%', value: `−${num(PREPAID.pgFee)}` },
    { label: '정산금', value: num(PREPAID.net) },
  ]
  return (
    <div className="relative rounded-2xl border border-dashed border-disabled px-4 pt-6 pb-4">
      <span className="absolute -top-2.5 left-4 rounded-full bg-white px-2 text-[13px] font-semibold text-muted">
        오프체인
      </span>
      <div className="flex flex-wrap items-center gap-2 text-[14px]">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[13px] text-muted">{s.label}</span>
              <span className="font-bold text-ink tabular-nums">{s.value}</span>
            </div>
            {s.label !== '정산금' && <ArrowRight aria-hidden="true" className="size-4 text-disabled" />}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] font-semibold text-muted">정산금을 60 : 40으로 나눠요</p>
      <div className="mt-2 flex gap-1.5" aria-label="정산금 60 대 40 분배">
        <div className="flex flex-[60] flex-col rounded-xl bg-brand px-4 py-3 text-white">
          <span className="text-[13px] text-white/80">
            건물 몫 <span className="font-extrabold text-white">60%</span>
          </span>
          <span className="text-[22px] leading-tight font-extrabold tabular-nums">{num(PREPAID.share)}</span>
        </div>
        <div className="flex flex-[40] flex-col rounded-xl bg-soft px-4 py-3 text-ink-2">
          <span className="text-[13px] text-muted">
            미유올 <span className="font-extrabold text-ink-2">40%</span>
          </span>
          <span className="text-[22px] leading-tight font-extrabold tabular-nums">{num(PREPAID.miyuol)}</span>
        </div>
      </div>
    </div>
  )
}

function SlotRow({
  slots,
  prevSlots,
  done,
  flashReject,
}: {
  slots: Record<MonthKey, SlotStatus>
  prevSlots: Record<MonthKey, SlotStatus>
  done: boolean
  flashReject?: MonthKey
}) {
  const dropIn = done && prevSlots.oct === 'none' && slots.oct === 'locked'
  const revealed = useStagger(MONTHS.length, dropIn, 150)
  const novNote = slots.nov === 'locked' && slots.dec === 'unlocked'

  return (
    <ul className="grid grid-cols-3 gap-2" aria-label="달별 잠금 상태">
      {MONTHS.map((m, i) => {
        const shown = !dropIn || i < revealed
        const status: SlotStatus = shown ? slots[m.key] : 'none'
        return (
          <li key={m.key} className="flex flex-col gap-1.5">
            <SlotCard
              label={m.label}
              status={status}
              drop={dropIn && shown}
              opening={done && prevSlots[m.key] === 'locked' && slots[m.key] === 'paid'}
              flash={flashReject === m.key}
            />
            {m.key === 'nov' && novNote && (
              <span className="text-[12px] leading-snug text-muted">시작된 기간이라 환불 대상 아님</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function SlotCard({
  label,
  status,
  drop,
  opening,
  flash,
}: {
  label: string
  status: SlotStatus
  drop: boolean
  opening: boolean
  flash: boolean
}) {
  const reduced = useReducedMotion()
  const border =
    status === 'paid'
      ? 'border-2 border-brand bg-white'
      : status === 'unlocked'
        ? 'border-2 border-danger bg-white'
        : status === 'locked'
          ? 'border border-line bg-soft-2'
          : 'border border-dashed border-disabled bg-white'

  return (
    <motion.div
      initial={drop && !reduced ? { y: -16, opacity: 0 } : false}
      animate={
        flash && !reduced
          ? { y: 0, opacity: 1, boxShadow: ['0 0 0 3px #d92d20', '0 0 0 3px #d92d20', '0 0 0 0px rgba(217,45,32,0)'] }
          : { y: 0, opacity: 1 }
      }
      transition={flash ? { duration: 1.1, times: [0, 0.9, 1] } : { duration: 0.25 }}
      className={`relative flex min-h-[112px] flex-col justify-between rounded-2xl px-3 py-3 transition-colors duration-300 ${border}`}
    >
      <span className="text-[14px] font-semibold text-ink-2">{label}</span>
      <span className={`text-[20px] font-extrabold tracking-tight tabular-nums ${status === 'none' ? 'text-disabled' : 'text-ink'}`}>
        {num(PREPAID.month)}원
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={opening && !reduced ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: opening ? 0.45 : 0 }}
        >
          <StatusChip status={status} />
        </motion.span>
      </AnimatePresence>
      {opening && !reduced && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute top-3 right-3"
          initial={{ rotate: 0, opacity: 1 }}
          animate={{ rotate: -35, opacity: 0, y: -6 }}
          transition={{ duration: 0.5 }}
        >
          <Lock className="size-5 text-muted" />
        </motion.span>
      )}
    </motion.div>
  )
}

function StatusChip({ status }: { status: SlotStatus }) {
  if (status === 'locked') {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted">
        <Lock aria-hidden="true" className="size-3.5" />
        잠김
      </span>
    )
  }
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] leading-snug font-semibold text-brand-text">
        <Check aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={3} />
        지급 완료 → 청소 업체
      </span>
    )
  }
  if (status === 'unlocked') {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] leading-snug font-semibold text-danger-text">
        <RotateCcw aria-hidden="true" className="size-3.5 shrink-0" />
        잠금 해제 · 환불 재원
      </span>
    )
  }
  return <span className="text-[13px] text-muted-2">잠금 전</span>
}
