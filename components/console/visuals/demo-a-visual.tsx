'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { VOTE_ORDER, UNITS, type DemoAState, type DemoAVisual, type Vote } from '@/lib/demos/demo-a'
import { num, percent } from '@/lib/format'
import type { Phase } from '@/hooks/useDemoPlayer'
import { CountUp } from '../count-up'
import { PayChip } from '../result-lines'

interface Props {
  visual: DemoAVisual
  prev: DemoAState
  next: DemoAState
  phase: Phase
}

export function DemoAVisualView({ visual, prev, next, phase }: Props) {
  const done = phase === 'done'
  const state = done ? next : prev
  switch (visual.type) {
    case 'vote':
      return (
        <VoteVisual
          votes={state.votes}
          prevVotes={prev.votes}
          animate={done}
          threshold={visual.threshold}
          attempts={visual.attempts ? (done ? 'rejected' : 'pending') : undefined}
        />
      )
    case 'calc':
      return <CalcStrip visual={visual} />
    case 'bank':
      return <BankVisual label={visual.label} deposited={state.deposited} minted={state.minted} />
    case 'vault':
      return <VaultNumber label={visual.label} value={state.vault} unchanged={done && prev.vault === next.vault} />
    case 'payout':
      return <PayoutVisual visual={visual} vault={state.vault} received={state.cleaner} active={done} />
    case 'history':
      return <HistoryVisual visual={visual} balance={state.vault} />
    case 'passCard':
      return <PassCard visual={visual} passed={state.passed} />
    case 'register':
      return <RegisterVisual visual={visual} wallet={state.vault} registered={state.deducted} />
    case 'perHousehold':
      return <PerHousehold label={visual.label} total={next.deducted} households={visual.households} />
  }
}

function VoteVisual({
  votes,
  prevVotes,
  animate,
  threshold,
  attempts,
}: {
  votes: Record<string, Vote>
  prevVotes: Record<string, Vote>
  animate: boolean
  threshold: number
  attempts?: AttemptState
}) {
  const reduced = useReducedMotion()
  const isFreshVote = animate && VOTE_ORDER.every((u) => prevVotes[u] === null) && VOTE_ORDER.some((u) => votes[u] !== null)
  const [revealed, setRevealed] = useState(isFreshVote && !reduced ? 0 : VOTE_ORDER.length)

  useEffect(() => {
    if (!isFreshVote || reduced) {
      setRevealed(VOTE_ORDER.length)
      return
    }
    setRevealed(0)
    const id = setInterval(() => {
      setRevealed((r) => {
        if (r >= VOTE_ORDER.length) {
          clearInterval(id)
          return r
        }
        return r + 1
      })
    }, 350)
    return () => clearInterval(id)
  }, [isFreshVote, reduced])

  const visibleVote = (u: string): Vote => {
    const order = VOTE_ORDER.indexOf(u as (typeof VOTE_ORDER)[number])
    if (order === -1) return votes[u]
    return order < revealed ? votes[u] : null
  }

  const total = UNITS.length
  const yes = UNITS.filter((u) => visibleVote(u) === 'yes').length
  const met = yes >= threshold
  const votingDone = revealed >= VOTE_ORDER.length && VOTE_ORDER.some((u) => votes[u] !== null)

  return (
    <div className="flex flex-col gap-4">
      <ul
        className={`grid grid-cols-4 gap-2 sm:grid-cols-8 ${attempts ? 'mt-7' : ''}`}
        aria-label="세대별 투표 현황"
      >
        {UNITS.map((u) => {
          const v = visibleVote(u)
          const label = v === 'yes' ? '찬성' : v === 'no' ? '반대' : '미투표'
          return (
            <motion.li
              key={u}
              aria-label={`${u}호 ${label}`}
              animate={{ scale: v ? [0.94, 1] : 1 }}
              transition={{ duration: 0.2 }}
              className={`relative flex h-11 items-center justify-center gap-1 rounded-xl text-[14px] font-bold tabular-nums transition-colors duration-300 ${
                v === 'yes'
                  ? 'bg-brand text-white'
                  : v === 'no'
                    ? 'bg-line text-ink-2'
                    : 'bg-soft text-muted-2'
              }`}
            >
              {u}
              {v === 'yes' && <Check aria-hidden="true" className="size-3" strokeWidth={3} />}
              {v === 'no' && <span className="text-[12px] font-semibold">반대</span>}
              {v === null && votingDone && <span className="text-[12px] font-semibold">미투표</span>}
              {attempts && u === DUP_UNIT && <DupTag rejected={attempts === 'rejected'} />}
            </motion.li>
          )
        })}
      </ul>
      <div>
        <div className="mb-2 flex items-center justify-between text-[15px]">
          <span className="font-semibold text-ink tabular-nums">
            찬성 {yes} / {total}명 · {percent(yes, total)}%
          </span>
          {met ? (
            <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-brand-text">
              <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
              정족수 충족
            </span>
          ) : (
            <span className="text-[14px] text-muted">기준 {threshold}명</span>
          )}
        </div>
        <div className="relative h-3 rounded-full bg-soft">
          <div
            className={`h-full rounded-full transition-[width,background-color] duration-[400ms] ${
              met ? 'bg-brand' : 'bg-disabled'
            }`}
            style={{ width: `${(yes / total) * 100}%` }}
          />
          <div
            aria-hidden="true"
            className="absolute -top-1 -bottom-1 w-0.5 bg-ink"
            style={{ left: `${(threshold / total) * 100}%` }}
          />
        </div>
      </div>
      {attempts && <AttemptCards state={attempts} />}
    </div>
  )
}

function CalcStrip({ visual }: { visual: Extract<DemoAVisual, { type: 'calc' }> }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-disabled px-4 pt-6 pb-4">
      <span className="absolute -top-2.5 left-4 rounded-full bg-white px-2 text-[13px] font-semibold text-muted">
        오프체인
      </span>
      <div className="flex flex-wrap items-center gap-2 text-[14px]">
        {visual.steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[13px] text-muted">{s.label}</span>
              <span className="font-bold text-ink tabular-nums">
                {s.sign ?? ''}
                {num(s.value)}
              </span>
            </div>
            {i < visual.steps.length - 1 && <ArrowRight aria-hidden="true" className="size-4 text-disabled" />}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] font-semibold text-muted">정산금을 60 : 40으로 나눠요</p>
      <div className="mt-2 flex gap-1.5" aria-label="정산금 60 대 40 분배">
        {visual.split.map((s, i) => {
          const m = s.label.match(/^(.*?)\s*(\d+%)$/)
          const name = m ? m[1] : s.label
          const pct = m ? m[2] : ''
          const first = i === 0
          return (
            <div
              key={s.label}
              className={`flex flex-col rounded-xl px-4 py-3 ${first ? 'flex-[60] bg-brand text-white' : 'flex-[40] bg-soft text-ink-2'}`}
            >
              <span className={`text-[13px] ${first ? 'text-white/80' : 'text-muted'}`}>
                {name} <span className={`font-extrabold ${first ? 'text-white' : 'text-ink-2'}`}>{pct}</span>
              </span>
              <span className="text-[22px] leading-tight font-extrabold tabular-nums">{num(s.value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BankVisual({ label, deposited, minted }: { label: string; deposited: number; minted: number }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[14px] text-muted">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-col rounded-2xl bg-soft px-4 py-3">
          <span className="text-[14px] text-muted">모의 입금</span>
          <span className="text-2xl font-bold text-ink">
            <CountUp value={deposited} />
            <span className="ml-0.5 text-base font-medium text-muted">원</span>
          </span>
        </div>
        <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-disabled" />
        <div className="flex flex-1 flex-col rounded-2xl bg-soft px-4 py-3">
          <span className="text-[14px] text-muted">TestKRW 전환</span>
          <span className="text-2xl font-bold text-ink">
            <CountUp value={minted} />
            <span className="ml-0.5 text-base font-medium text-muted">TestKRW</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function VaultNumber({ label, value, unchanged }: { label: string; value: number; unchanged?: boolean }) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="text-[14px] text-muted">{label}</span>
      <span className="mt-1 text-[56px] leading-none font-extrabold tracking-tight text-ink">
        <CountUp value={value} />
        <span className="ml-1 text-2xl font-semibold text-muted">TestKRW</span>
      </span>
      <span className="mt-2 text-[13px] text-muted">{unchanged ? '변동 없음 · TestKRW' : 'TestKRW(실제 예금 아님)'}</span>
    </div>
  )
}

function PayoutVisual({
  visual,
  vault,
  received,
  active,
}: {
  visual: Extract<DemoAVisual, { type: 'payout' }>
  vault: number
  received: number
  active: boolean
}) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col rounded-2xl bg-soft px-4 py-4">
        <span className="text-[13px] text-muted">{visual.label}</span>
        <span className="mt-1 text-4xl font-extrabold tracking-tight text-ink">
          <CountUp value={vault} />
          <span className="ml-1 text-lg font-semibold text-muted">원</span>
        </span>
      </div>
      <ArrowRight aria-hidden="true" className="size-5 shrink-0 self-center text-disabled max-sm:rotate-90" />
      <div
        className={`flex flex-1 flex-col rounded-2xl border-2 bg-white px-4 py-4 transition-colors duration-[400ms] ${
          active ? 'border-brand' : 'border-line'
        }`}
      >
        <span className="flex items-center justify-between gap-2 text-[14px] font-semibold text-ink-2">
          {visual.payee}
          {active && <PayChip label={visual.chip} />}
        </span>
        <span className={`mt-1 text-4xl font-extrabold tracking-tight ${received > 0 ? 'text-brand-text' : 'text-ink'}`}>
          {received > 0 ? '+' : ''}
          <CountUp value={received} />
          <span className="ml-1 text-lg font-semibold text-muted">원</span>
        </span>
        <span className="mt-1 text-[13px] text-muted">{visual.basis}</span>
      </div>
    </div>
  )
}

function HistoryVisual({ visual, balance }: { visual: Extract<DemoAVisual, { type: 'history' }>; balance: number }) {
  return (
    <ol className="flex flex-col">
      {visual.rows.map((r) => (
        <li key={r.label} className="flex items-start gap-3 border-b border-line-soft py-3">
          <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-disabled" />
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-ink">{r.label}</p>
            <p className="text-[13px] text-muted">{r.sub}</p>
          </div>
          <span className="text-[17px] font-bold text-ink tabular-nums">
            {r.sign}
            {num(r.amount)}
          </span>
        </li>
      ))}
      <li className="flex items-end justify-between pt-4">
        <span className="text-[15px] text-muted">{visual.balanceLabel}</span>
        <span className="text-4xl font-extrabold tracking-tight text-ink tabular-nums">
          {num(balance)}
          <span className="ml-1 text-lg font-semibold text-muted">원</span>
        </span>
      </li>
    </ol>
  )
}

function PassCard({ visual, passed }: { visual: Extract<DemoAVisual, { type: 'passCard' }>; passed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-soft-2 py-6 text-center">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-lg font-bold transition-colors duration-[400ms] ${
          passed ? 'bg-brand-soft text-brand-text' : 'bg-soft text-muted'
        }`}
      >
        {passed && <Check aria-hidden="true" className="size-4" strokeWidth={3} />}
        {passed ? visual.badge : '결과 확인 전'}
      </span>
      <PayChip label={visual.chip} size="lg" />
      <span className="text-[14px] text-muted">{visual.sub}</span>
    </div>
  )
}

function RegisterVisual({
  visual,
  wallet,
  registered,
}: {
  visual: Extract<DemoAVisual, { type: 'register' }>
  wallet: number
  registered: number
}) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="text-[14px] text-muted">{visual.label}</span>
      <span className="mt-1 text-[56px] leading-none font-extrabold tracking-tight text-ink">
        <CountUp value={wallet} />
        <span className="ml-1 text-2xl font-semibold text-muted">원</span>
      </span>
      <span className="mt-3 inline-flex items-center gap-2 text-[14px] text-muted">
        {registered > 0 ? (
          <>
            <PayChip label={visual.chip} />
            {visual.sub} · {num(registered)}원
          </>
        ) : (
          `${visual.sub} · 등록 전`
        )}
      </span>
    </div>
  )
}

function PerHousehold({ label, total, households }: { label: string; total: number; households: number }) {
  const each = Math.floor(total / households)
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="text-[16px] font-semibold text-ink-2">{label}</span>
      <span className="mt-2 text-[64px] leading-none font-extrabold tracking-tight text-brand-text">
        <CountUp value={each} from={0} />
        <span className="ml-1 text-2xl font-semibold text-muted">원 차감</span>
      </span>
      <span className="mt-3 text-[14px] text-muted tabular-nums">
        {num(total)}원 ÷ {households}세대
      </span>
    </div>
  )
}

type AttemptState = 'pending' | 'rejected'
const DUP_UNIT = '302'

function DupTag({ rejected }: { rejected: boolean }) {
  return (
    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white">
      {rejected ? '중복 투표 거부' : '중복 투표 시도'}
    </span>
  )
}

function AttemptCards({ state }: { state: AttemptState }) {
  const rejected = state === 'rejected'
  const items = [
    { who: '미등록 계정', sub: '승인 주민 목록에 없음', reason: '승인 주민이 아니라서 거부' },
    { who: '302호 (이미 찬성)', sub: '한 번 더 투표하려고 함', reason: '이미 투표해서 거부' },
  ]
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="거부될 투표 시도">
      {items.map((it) => (
        <li
          key={it.who}
          className={`flex flex-col gap-1 rounded-2xl border-2 px-4 py-3 transition-colors duration-300 ${
            rejected ? 'border-danger bg-danger-soft' : 'border-dashed border-danger bg-white'
          }`}
        >
          <span className="text-[13px] text-muted">투표 시도</span>
          <span className="text-[18px] font-extrabold text-ink">{it.who}</span>
          {rejected ? (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1 text-[15px] font-bold text-danger-text"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={3} />
              {it.reason}
            </motion.span>
          ) : (
            <span className="text-[14px] text-muted">{it.sub}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
