'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeftRight, Check, X } from 'lucide-react'
import {
  ANNUAL_TOTAL,
  SUB_TOTAL,
  SUBSCRIBERS,
  WATERFALL,
  type DemoDState,
  type DemoDVisual,
  type WaterfallRow,
} from '@/lib/demos/demo-d'
import { num } from '@/lib/format'
import type { Phase } from '@/hooks/useDemoPlayer'
import { CountUp } from '../count-up'
import { useStagger } from './use-stagger'

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
    case 'subscribe':
      return (
        <Subscribe
          subscribed={state.subscribed}
          fresh={done && prev.subscribed === 0 && next.subscribed > 0}
          showD={Boolean(visual.showD)}
          dRejected={state.dRejected}
        />
      )
    case 'revenue':
      return <Revenue value={state.revenue} />
    case 'waterfall':
      return <Waterfall year={visual.year} run={done} />
    case 'transfer':
      return <Transfer e={state.transferE} f={state.transferF} />
  }
}

function Subscribe({
  subscribed,
  fresh,
  showD,
  dRejected,
}: {
  subscribed: number
  fresh: boolean
  showD: boolean
  dRejected: boolean
}) {
  const revealed = useStagger(SUBSCRIBERS.length, fresh, 450)
  const shownCount = fresh ? revealed : subscribed
  return (
    <div className="flex flex-col">
      <ul className="flex flex-col" aria-label="청약 현황">
        {SUBSCRIBERS.map((r, i) => {
          const shown = i < shownCount
          return (
            <li key={r.id}>
              <motion.div
                initial={false}
                animate={{ opacity: shown ? 1 : 0.45 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-[56px_1fr_auto_1fr] items-center gap-2 border-b border-line-soft py-2.5 text-[14px] sm:grid-cols-[64px_1fr_auto_1fr_auto]"
              >
                <span className="font-semibold text-ink">주민 {r.id}</span>
                <span className="text-right font-bold text-ink tabular-nums">{num(r.amount)}</span>
                <ArrowLeftRight aria-label="동시 교환" className={`size-4 ${shown ? 'text-brand' : 'text-disabled'}`} />
                <span className="flex flex-col">
                  <span className="font-bold text-ink tabular-nums">권리 {shown ? num(r.amount) : '—'}</span>
                  <span className="text-[12px] text-muted tabular-nums">연 원리금 {num(r.annual)}</span>
                </span>
                <span className="col-span-4 sm:col-span-1">
                  {shown ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[13px] font-semibold text-brand-text">
                      <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
                      동시 교환
                    </span>
                  ) : (
                    <span className="text-[13px] text-muted">청약 전</span>
                  )}
                </span>
              </motion.div>
            </li>
          )
        })}
        {showD && (
          <li className="pt-2">
            {dRejected ? (
              <div className="flex items-start gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-[14px] text-ink" role="status">
                <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={3} />
                <p className="leading-snug">
                  <span className="font-semibold">주민 D 6,000,000</span> ·{' '}
                  <span className="font-semibold text-danger-text">거부</span> · 1인 한도(500만 원) 초과 — 대금·권리토큰
                  잔액 모두 변동 없음
                  <span className="ml-2 font-mono text-[12px] text-muted">PerPersonCapExceeded · status 0</span>
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-line px-4 py-3 text-[14px] text-ink-2">
                주민 D · 6,000,000 청약 시도
              </div>
            )}
          </li>
        )}
      </ul>
      <div className="flex items-end justify-between pt-3">
        <span className="text-[14px] text-muted">
          합계 <span className="font-bold text-ink tabular-nums">{shownCount === SUBSCRIBERS.length ? num(SUB_TOTAL) : '—'}</span>
        </span>
        <span className="text-[14px] text-muted">
          연 원리금 합계{' '}
          <span className="text-[20px] font-extrabold text-ink tabular-nums">
            {shownCount === SUBSCRIBERS.length ? num(ANNUAL_TOTAL) : '—'}
          </span>
        </span>
      </div>
      {showD && <p className="mt-2 text-[13px] text-muted">한쪽 이전이 실패하면 거래 전체가 취소됩니다.</p>}
    </div>
  )
}

function Revenue({ value }: { value: number }) {
  const confirmed = value > 0
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="text-[14px] text-muted">1년차 판매대금</span>
      <span className="mt-1 text-[48px] leading-none font-extrabold tracking-tight text-ink sm:text-[56px]">
        <CountUp value={value} duration={900} />
        <span className="ml-1 text-2xl font-semibold text-muted">원</span>
      </span>
      {confirmed ? (
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-[14px] font-semibold text-brand-text">
          <Check aria-hidden="true" className="size-4" strokeWidth={3} />
          정산서 · 계약가격 · 입금내역 일치
        </span>
      ) : (
        <span className="mt-3 text-[14px] text-muted">정산서 · 계약가격 · 입금내역 확인 전</span>
      )}
    </div>
  )
}

const BAR_TONE: Record<WaterfallRow['tone'], string> = {
  ink: 'bg-ink',
  'ink-2': 'bg-ink-2',
  sub: 'bg-sub',
  muted: 'bg-muted-2',
  brand: 'bg-brand',
  withdraw: 'bg-[repeating-linear-gradient(135deg,var(--color-ink-2)_0_4px,transparent_4px_8px)]',
}

function Waterfall({ year, run }: { year: 1 | 6; run: boolean }) {
  const reduced = useReducedMotion()
  const data = WATERFALL[year]
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="flex flex-col">
          <span className="text-[13px] text-muted">{data.inputLabel}</span>
          <span className="text-[24px] leading-tight font-extrabold text-ink tabular-nums">{num(data.input)}원</span>
        </span>
        <span className="rounded-xl bg-soft px-3 py-1.5 text-[13px] text-ink-2 tabular-nums">
          준비금 {num(data.reserve[0])} → <span className="font-bold">{run ? num(data.reserve[1]) : '—'}</span>
        </span>
      </div>
      <ol className="flex flex-col">
        {data.rows.map((r, i) => {
          const pct = (r.value / data.input) * 100
          const withdraw = r.tone === 'withdraw'
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
                <span className="truncate text-[12px] text-muted">{r.sub}</span>
              </span>
              <span
                className={`relative col-span-3 col-start-1 row-start-2 flex h-3 rounded-full bg-soft sm:col-span-1 sm:col-start-3 sm:row-start-1 ${
                  withdraw ? 'justify-end' : ''
                }`}
              >
                <motion.span
                  className={`h-full rounded-full ${BAR_TONE[r.tone]}`}
                  initial={{ width: '0%' }}
                  animate={{ width: run ? `${Math.max(pct, r.value > 0 ? (withdraw ? 6 : 1.5) : 0)}%` : '0%' }}
                  transition={reduced ? { duration: 0 } : { duration: 0.45, delay: run ? i * 0.3 : 0, ease: 'easeOut' }}
                />
              </span>
              <span className="col-start-3 row-start-1 flex flex-col items-end sm:col-start-4">
                <span
                  className={`text-[15px] font-bold tabular-nums ${r.tone === 'brand' ? 'text-brand-text' : 'text-ink'}`}
                >
                  {run ? `${withdraw ? '−' : ''}${num(r.value)}` : '—'}
                </span>
                {run && r.tag && (
                  <span className={`text-[12px] font-semibold ${r.tone === 'brand' ? 'text-brand-text' : 'text-ink-2'}`}>
                    {r.tag}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
      {year === 6 && (
        <p className="text-[13px] leading-relaxed text-muted">
          운영비·융자 뒤 27,632,058원만 남아 부족분 3,847,327원을 준비금에서 메웠습니다.
        </p>
      )}
    </div>
  )
}

function Transfer({ e, f }: { e: boolean; f: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 transition-colors duration-300 ${
          e ? 'border-brand bg-white' : 'border-line bg-white'
        }`}
      >
        <span className="text-[15px] text-ink">
          <span className="font-bold">A → E</span> <span className="text-[13px] text-muted">본인 확인된 지갑</span> ·{' '}
          <span className="font-bold tabular-nums">500,000</span>
        </span>
        {e ? (
          <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-brand-text">
            <Check aria-hidden="true" className="size-4" strokeWidth={3} />
            이전 완료
          </span>
        ) : (
          <span className="text-[13px] text-muted">이전 전</span>
        )}
      </div>
      {f ? (
        <div className="flex items-start gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-[14px] text-ink" role="status">
          <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={3} />
          <p className="leading-snug">
            <span className="font-bold">A → F</span> · 500,000 · <span className="font-semibold text-danger-text">거부</span> ·
            미확인 지갑 — 기준일 명부 유지
            <span className="ml-2 font-mono text-[12px] text-muted">NotEligible · status 0</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-4 py-3">
          <span className="text-[15px] text-ink">
            <span className="font-bold">A → F</span> <span className="text-[13px] text-muted">미확인 지갑</span> ·{' '}
            <span className="font-bold tabular-nums">500,000</span>
          </span>
          <span className="text-[13px] text-muted">시도 전</span>
        </div>
      )}
      <p className="text-[13px] text-muted">권리 기준일에 보유자 명부를 확정해 양도 전후 이중 지급을 막습니다.</p>
    </div>
  )
}
