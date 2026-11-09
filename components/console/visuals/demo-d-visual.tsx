'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeftRight, ArrowRight, Check, X } from 'lucide-react'
import {
  DVP,
  REGISTRY,
  RESIDENT_DUE,
  TRANSFER_ATTEMPT,
  WATERFALL,
  type DemoDState,
  type DemoDVisual,
  type WaterfallKey,
  type WaterfallRow,
} from '@/lib/demos/demo-d'
import { num } from '@/lib/format'
import type { Phase } from '@/hooks/useDemoPlayer'
import { CountUp } from '../count-up'

interface Props {
  visual: DemoDVisual
  prev: DemoDState
  next: DemoDState
  phase: Phase
}

export function DemoDVisualView({ visual, prev, next, phase }: Props) {
  const done = phase === 'done'
  const state = done ? next : prev
  switch (visual.type) {
    case 'waterfall':
      return <Waterfall dataKey={visual.key} run={done} />
    case 'transferReject':
      return <TransferReject rejected={state.transferRejected} />
    case 'dvp':
      return <Dvp done={state.dvpDone} />
  }
}

const BAR_TONE: Record<WaterfallRow['tone'], string> = {
  ink: 'bg-ink',
  'ink-2': 'bg-ink-2',
  sub: 'bg-sub',
  muted: 'bg-muted-2',
  brand: 'bg-brand',
  withdraw: 'bg-[repeating-linear-gradient(135deg,var(--color-ink-2)_0_4px,transparent_4px_8px)]',
  defer: 'bg-danger',
}

function Waterfall({ dataKey, run }: { dataKey: WaterfallKey; run: boolean }) {
  const reduced = useReducedMotion()
  const data = WATERFALL[dataKey]
  const reserveChanged = data.reserve[0] !== data.reserve[1]
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="flex flex-col">
          <span className="text-[13px] text-muted">{data.inputLabel}</span>
          <span className="text-[24px] leading-tight font-extrabold text-ink tabular-nums">{num(data.input)}원</span>
        </span>
      </div>
      <ReserveHero before={data.reserve[0]} after={data.reserve[1]} run={run} />
      <ol className="flex flex-col">
        {data.rows.map((r, i) => {
          const pct = Math.min((r.value / data.input) * 100, 100)
          const withdraw = r.tone === 'withdraw'
          const defer = r.tone === 'defer'
          return (
            <li
              key={r.label}
              className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-line-soft py-2 last:border-b-0 sm:grid-cols-[22px_150px_minmax(0,1fr)_auto]"
            >
              <span className="flex size-[22px] items-center justify-center rounded-full bg-soft text-[12px] font-bold text-ink-2">
                {i + 1}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[14px] font-semibold text-ink">{r.label}</span>
                <span className="text-[12px] leading-snug text-muted">{r.sub}</span>
              </span>
              <span
                className={`relative col-span-3 col-start-1 row-start-2 flex h-3 rounded-full bg-soft sm:col-span-1 sm:col-start-3 sm:row-start-1 ${
                  withdraw ? 'justify-end' : ''
                }`}
              >
                <motion.span
                  className={`flex h-full overflow-hidden rounded-full ${r.fromReserve ? '' : BAR_TONE[r.tone]}`}
                  initial={{ width: '0%' }}
                  animate={{ width: run ? `${Math.max(pct, r.value > 0 ? 1.5 : 0)}%` : '0%' }}
                  transition={reduced ? { duration: 0 } : { duration: 0.45, delay: run ? i * 0.3 : 0, ease: 'easeOut' }}
                >
                  {r.fromReserve ? (
                    <>
                      {/* 수입으로 낸 부분 + 준비금에서 메운 부분(빨간 빗금) */}
                      <span className={`h-full ${BAR_TONE[r.tone]}`} style={{ width: `${((r.value - r.fromReserve) / r.value) * 100}%` }} />
                      <span
                        className="h-full flex-1 bg-[repeating-linear-gradient(135deg,var(--color-danger)_0_4px,transparent_4px_8px)]"
                      />
                    </>
                  ) : null}
                </motion.span>
              </span>
              <span className="col-start-3 row-start-1 flex flex-col items-end sm:col-start-4">
                <span
                  className={`text-[15px] font-bold tabular-nums ${
                    r.tone === 'brand' ? 'text-brand-text' : defer ? 'text-danger-text' : 'text-ink'
                  }`}
                >
                  {run ? `${withdraw ? '−' : ''}${num(r.value)}` : '—'}
                </span>
                {run && r.tag && (
                  <span
                    className={`text-[12px] font-semibold ${defer || r.fromReserve ? 'text-danger-text' : 'text-ink-2'}`}
                  >
                    {r.tag}
                    {defer && ` ${num(RESIDENT_DUE)}`}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
      {run && data.note && <p className="text-[13px] leading-relaxed text-muted">{data.note}</p>}
    </div>
  )
}

// 준비금을 크게 보여줌: 정상 회차는 그대로(초록), 악화 회차는 깎이는 모습(빨강) → 두 화면 비교
function ReserveHero({ before, after, run }: { before: number; after: number; run: boolean }) {
  const reduced = useReducedMotion()
  const used = before - after
  const keepPct = (after / before) * 100
  const kept = used === 0
  const tone = !run ? 'border-line bg-white' : kept ? 'border-brand bg-brand-soft' : 'border-danger bg-danger-soft'
  return (
    <div className={`rounded-2xl border-2 px-5 py-4 transition-colors duration-300 ${tone}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <span className="flex flex-col">
          <span className="text-[14px] font-semibold text-ink-2">채무상환 준비금</span>
          <span
            className={`text-[40px] leading-none font-extrabold tracking-tight tabular-nums sm:text-[44px] ${
              !run ? 'text-ink' : kept ? 'text-brand-text' : 'text-danger-text'
            }`}
          >
            <CountUp value={run ? after : before} duration={1200} />
            <span className="ml-1 text-xl font-semibold text-muted">원</span>
          </span>
        </span>
        <span className="flex flex-col items-end">
          <span className="text-[13px] text-muted tabular-nums">시작 {num(before)}원</span>
          <span
            className={`text-[20px] font-extrabold tabular-nums ${
              !run ? 'text-disabled' : kept ? 'text-brand-text' : 'text-danger-text'
            }`}
          >
            {!run ? '실행 전' : kept ? '인출 없음 · 변동 없음' : `−${num(used)}원 인출`}
          </span>
        </span>
      </div>
      <div className="relative mt-3 flex h-4 overflow-hidden rounded-full bg-white">
        <motion.span
          className="h-full bg-ink-2"
          initial={false}
          animate={{ width: run ? `${keepPct}%` : '100%' }}
          transition={reduced ? { duration: 0 } : { duration: 1.2, ease: 'easeOut' }}
        />
        <motion.span
          className="h-full bg-[repeating-linear-gradient(135deg,var(--color-danger)_0_5px,transparent_5px_10px)]"
          initial={false}
          animate={{ width: run ? `${100 - keepPct}%` : '0%' }}
          transition={reduced ? { duration: 0 } : { duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function TransferReject({ rejected }: { rejected: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex flex-wrap items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors duration-300 ${
          rejected ? 'border-danger bg-danger-soft' : 'border-dashed border-danger bg-white'
        }`}
      >
        <span className="text-[15px] font-bold text-ink">{TRANSFER_ATTEMPT.from}</span>
        <ArrowRight aria-hidden="true" className="size-4 text-muted" />
        <span className="text-[15px] font-bold text-ink">{TRANSFER_ATTEMPT.to}</span>
        <span className="text-[15px] font-bold text-ink tabular-nums">권리토큰 {num(TRANSFER_ATTEMPT.amount)}</span>
        <span className="ml-auto">
          {rejected ? (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1 text-[15px] font-bold text-danger-text"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={3} />
              전송 실패
            </motion.span>
          ) : (
            <span className="text-[13px] text-muted">직접 전송 시도 전</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line px-4 py-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[15px] font-bold text-ink">권리 기준일 명부</span>
            {rejected && (
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-text">
                <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
                그대로
              </span>
            )}
          </div>
          <ul className="flex flex-col">
            {REGISTRY.map((r) => (
              <li key={r.holder} className="flex justify-between border-b border-line-soft py-2 text-[14px] last:border-b-0">
                <span className="text-ink-2">{r.holder}</span>
                <span className="font-bold text-ink tabular-nums">{num(r.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col rounded-2xl border border-line px-4 py-3">
          <span className="pb-1 text-[15px] font-bold text-ink">탐색기 기록 (모의)</span>
          <dl className="flex flex-col text-[14px]">
            <div className="flex justify-between border-b border-line-soft py-2">
              <dt className="text-muted">상태</dt>
              <dd className={`font-bold ${rejected ? 'text-danger-text' : 'text-muted'}`}>{rejected ? '실패' : '—'}</dd>
            </div>
            <div className="flex justify-between border-b border-line-soft py-2">
              <dt className="text-muted">가스 한도</dt>
              <dd className="text-ink">고정</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted">이전된 권리</dt>
              <dd className="text-ink tabular-nums">{rejected ? '0' : '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

function Dvp({ done }: { done: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border-2 px-4 py-4 transition-colors duration-300 ${
          done ? 'border-brand' : 'border-line'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-[13px] text-muted">{DVP.who} 지급</span>
          <span className="text-[22px] font-extrabold text-ink tabular-nums">
            {num(DVP.amount)}
            <span className="ml-1 text-[14px] font-semibold text-muted">TestKRW</span>
          </span>
        </div>
        <ArrowLeftRight aria-label="교환" className={`size-6 ${done ? 'text-brand' : 'text-disabled'}`} />
        <div className="flex flex-col items-end">
          <span className="text-[13px] text-muted">{DVP.who} 수령</span>
          <span className="text-[22px] font-extrabold text-ink tabular-nums">
            권리토큰 {done ? num(DVP.amount) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
