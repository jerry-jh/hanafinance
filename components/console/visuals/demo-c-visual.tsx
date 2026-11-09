'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Check, Clock, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DISTRICT, type DemoCState, type DemoCVisual } from '@/lib/demos/demo-c'
import { num } from '@/lib/format'
import type { Phase } from '@/hooks/useDemoPlayer'
import { CountUp } from '../count-up'
import { useStagger } from './use-stagger'

interface Props {
  visual: DemoCVisual
  prev: DemoCState
  next: DemoCState
  phase: Phase
}

export function DemoCVisualView({ visual, prev, next, phase }: Props) {
  const done = phase === 'done'
  const state = done ? next : prev
  switch (visual.type) {
    case 'options':
      return <Options chosen={state.supportChosen} />
    case 'subsidy':
      return <SubsidyCard state={state} fresh={done && prev.openDays === 0 && next.openDays > 0} />
    case 'incentive':
      return (
        <IncentiveCard
          state={state}
          freshUsage={done && !prev.usageSubmitted && next.usageSubmitted}
          freshApproval={done && !prev.approved && next.approved}
        />
      )
    case 'hold':
      return <HoldCard done={done} />
    case 'compare':
      return <Compare submitted={state.usageSubmitted} fresh={done && !prev.usageSubmitted && next.usageSubmitted} />
    case 'rejects':
      return <Rejects done={done} />
    case 'facility':
      return <Facility paid={state.facilityPaid} />
    case 'buckets':
      return <Buckets />
  }
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-md bg-soft px-1.5 py-0.5 text-[12px] font-semibold text-muted">{children}</span>
}

function Options({ chosen }: { chosen: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        className={`flex flex-col gap-1 rounded-2xl border border-line px-4 py-4 transition-opacity duration-300 ${
          chosen ? 'opacity-45' : ''
        }`}
      >
        <span className="text-[16px] font-bold text-ink">일시 · 시설개선비</span>
        <span className="text-[13px] leading-snug text-muted">750만 원 + 5면 초과분 면당 30만 원 · 의무 3년</span>
      </div>
      <div
        className={`flex flex-col gap-1 rounded-2xl border-2 px-4 py-4 transition-colors duration-300 ${
          chosen ? 'border-brand' : 'border-line'
        }`}
      >
        <span
          className={`font-bold transition-all duration-300 ${chosen ? 'text-[24px] text-brand-text' : 'text-[16px] text-ink'}`}
        >
          월별 · 운영보전금
        </span>
        <span className="text-[13px] leading-snug text-muted">면당 월 20,000원 · 의무 2년</span>
        {chosen && (
          <span className="mt-1 inline-flex items-center gap-1 self-start rounded-full bg-brand-soft px-2.5 py-0.5 text-[13px] font-semibold text-brand-text">
            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            가결 · 6/8명 · 75%
          </span>
        )}
      </div>
    </div>
  )
}

function ProgramCard({ title, tag, children }: { title: string; tag: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line px-4 py-3">
      <div className="flex items-center gap-2 pb-1">
        <span className="text-[16px] font-bold text-ink">{title}</span>
        <Tag>{tag}</Tag>
      </div>
      <dl className="flex flex-col">{children}</dl>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-line-soft py-2.5 last:border-b-0">
      <dt className="w-20 shrink-0 text-[14px] text-muted">{label}</dt>
      <dd className="min-w-0 flex-1 text-[14px] text-ink">{children}</dd>
    </div>
  )
}

function SubsidyCard({ state, fresh }: { state: DemoCState; fresh: boolean }) {
  const revealed = useStagger(DISTRICT.days, fresh, 45)
  const filled = fresh ? revealed : state.openDays
  const complete = filled >= DISTRICT.days
  const paid = state.subsidyPaid > 0
  return (
    <ProgramCard title="가. 운영보전금" tag="현행 제도">
      <Row label="조건">등록 면수 공유</Row>
      <Row label="공유 데이터">
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-[repeat(31,minmax(0,1fr))] gap-[2px]" aria-hidden="true">
            {Array.from({ length: DISTRICT.days }, (_, i) => (
              <span
                key={i}
                className={`h-4 rounded-[2px] transition-colors duration-150 ${i < filled ? 'bg-brand' : 'bg-soft'}`}
              />
            ))}
          </div>
          <span className="text-[13px] text-muted tabular-nums">
            {filled}/{DISTRICT.days}일
          </span>
          {complete ? (
            <span className="inline-flex items-center gap-1 font-semibold text-brand-text">
              <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
              10월 공유 유지 확인 · 5면
            </span>
          ) : (
            filled === 0 && <span className="text-muted">연결 전</span>
          )}
        </div>
      </Row>
      <Row label="계산">
        <span className="tabular-nums">5면 × 20,000원{paid ? ` = ${num(DISTRICT.subsidy)}` : ''}</span>
      </Row>
      <Row label="지급">
        {paid ? (
          <span className="text-[24px] leading-tight font-extrabold text-brand-text">
            +<CountUp value={state.subsidyPaid} from={0} />원
          </span>
        ) : (
          <span className="text-muted">대기</span>
        )}
      </Row>
    </ProgramCard>
  )
}

function IncentiveCard({
  state,
  freshUsage,
  freshApproval,
}: {
  state: DemoCState
  freshUsage: boolean
  freshApproval: boolean
}) {
  const steps = useStagger(2, freshApproval, 300, 150)
  const o = state.usageSubmitted
  const g = state.approved && (!freshApproval || steps >= 1)
  const b = state.executed && (!freshApproval || steps >= 2)
  return (
    <div className="flex flex-col gap-3">
      <ProgramCard title="나. 지역 인센티브 (예: 인천e음 포인트)" tag="가상">
        <Row label="조건">이용률 80% 이상 + 구청 승인</Row>
        <Row label="이용률">
          <Gauge key={freshUsage ? 'fresh' : 'static'} submitted={o} fresh={freshUsage} />
        </Row>
        <Row label="구청 승인">
          {g ? (
            <span className="inline-flex items-center gap-1 font-semibold text-brand-text">
              <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
              승인 서명
            </span>
          ) : (
            <span className="text-muted">{o ? '승인 대기' : '대기'}</span>
          )}
        </Row>
        <Row label="지급">
          {b ? (
            <span className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-muted tabular-nums">판매 4면 × 3,000원 = {num(DISTRICT.incentive)}</span>
              <span className="text-[24px] leading-tight font-extrabold text-brand-text">
                +<CountUp value={DISTRICT.incentive} from={0} />원
              </span>
            </span>
          ) : (
            <span className="text-muted">대기</span>
          )}
        </Row>
      </ProgramCard>
      <ApprovalChain o={o} g={g} b={b} />
      {o && !g && (
        <div className="rounded-2xl bg-soft px-4 py-3 text-[14px] font-semibold text-ink-2">
          승인 대기 · 빌라 1동 지역 인센티브 12,000원
        </div>
      )}
    </div>
  )
}

function Gauge({ submitted, fresh }: { submitted: boolean; fresh: boolean }) {
  const reduced = useReducedMotion()
  const animate = fresh && !reduced
  const [reached, setReached] = useState(!animate)
  const value = submitted ? 80 : 0
  const ok = submitted && reached
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-3 rounded-full bg-soft">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${ok ? 'bg-brand' : 'bg-disabled'}`}
          initial={animate ? { width: '0%' } : false}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          onAnimationComplete={() => setReached(true)}
        />
        <div aria-hidden="true" className="absolute -top-1 -bottom-1 w-0.5 bg-ink" style={{ left: '80%' }} />
      </div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted tabular-nums">
          {submitted ? '판매 4면 ÷ 공유 5면 = 80%' : '통계 제출 전'}
        </span>
        {ok ? (
          <span className="inline-flex items-center gap-1 font-semibold text-brand-text">
            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            기준 충족
          </span>
        ) : (
          <span className="text-muted">기준 80%</span>
        )}
      </div>
    </div>
  )
}

function ApprovalChain({ o, g, b }: { o: boolean; g: boolean; b: boolean }) {
  const nodes = [
    { key: 'O', who: '미유올', what: '데이터 연결', done: o },
    { key: 'G', who: '구청', what: '승인', done: g },
    { key: 'B', who: '은행', what: '실행', done: b },
  ]
  return (
    <ol className="flex items-center" aria-label="승인 순서">
      {nodes.map((n, i) => (
        <li key={n.key} className={`flex items-center ${i < nodes.length - 1 ? 'flex-1' : ''}`}>
          <div
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[13px] transition-colors duration-300 ${
              n.done ? 'border-brand bg-brand-soft text-brand-text' : 'border-line bg-white text-muted'
            }`}
          >
            {n.done && <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />}
            <span className="font-bold">
              {n.who}
            </span>
            <span>{n.what}</span>
          </div>
          {i < nodes.length - 1 && (
            <div aria-hidden="true" className="mx-1.5 h-0.5 flex-1 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-brand transition-[width] duration-300"
                style={{ width: nodes[i + 1].done ? '100%' : '0%' }}
              />
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}

function HoldCard({ done }: { done: boolean }) {
  const months = [
    { label: '10월', spaces: DISTRICT.openSpaces, ok: true },
    { label: '11월', spaces: DISTRICT.heldSpaces, ok: false },
  ]
  return (
    <ProgramCard title="가. 운영보전금 · 공유 면수 변화" tag="현행 제도">
      <Row label="조건">5면 이상 공유</Row>
      {months.map((m) => {
        const show = m.ok || done
        return (
          <Row key={m.label} label={m.label}>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: DISTRICT.openSpaces }, (_, i) => (
                  <span
                    key={i}
                    className={`h-6 flex-1 rounded-md transition-colors duration-300 ${
                      i < m.spaces ? (m.ok ? 'bg-brand' : 'bg-disabled') : 'border border-dashed border-danger bg-danger-soft'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[13px] text-muted tabular-nums">공유 {m.spaces}면</span>
              {m.ok ? (
                <span className="inline-flex items-center gap-1 font-semibold text-brand-text">
                  <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
                  5면 × 20,000원 = {num(DISTRICT.subsidy)}원 지급
                </span>
              ) : show ? (
                <span className="inline-flex items-center gap-1 font-semibold text-danger-text">
                  <X aria-hidden="true" className="size-3.5" strokeWidth={3} />
                  최소 요건(5면) 미달 · 지급 보류 · 0원
                </span>
              ) : (
                <span className="text-muted">지급일 대기</span>
              )}
            </div>
          </Row>
        )
      })}
      <p className="pt-2 text-[13px] leading-relaxed text-muted">
        실제 지급 여부는 사업 지침과 미추홀구 확인에 따라 적격성을 다시 검토합니다.
      </p>
    </ProgramCard>
  )
}

function Compare({ submitted, fresh }: { submitted: boolean; fresh: boolean }) {
  const reduced = useReducedMotion()
  const animate = fresh && !reduced
  const rows = [
    {
      name: '가상 빌라 1동',
      calc: `판매 ${DISTRICT.soldSpaces}면 ÷ 공유 ${DISTRICT.openSpaces}면`,
      pct: 80,
      ok: true,
      result: `대상 · 판매 ${DISTRICT.soldSpaces}면 × 3,000원 = ${num(DISTRICT.incentive)}원`,
    },
    {
      name: '가상 아파트 1동',
      calc: `판매 ${DISTRICT.aptSoldSpaces}면 ÷ 공유 ${DISTRICT.aptOpenSpaces}면`,
      pct: 60,
      ok: false,
      result: '조건 미달 · 0원',
    },
  ]
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[16px] font-bold text-ink">지역 인센티브 (예: 인천e음 포인트)</span>
        <Tag>가상</Tag>
        <span className="ml-auto text-[13px] text-muted">기준 이용률 80%</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.name}
            className={`flex flex-col gap-3 rounded-2xl border-2 px-4 py-4 transition-colors duration-300 ${
              submitted ? (r.ok ? 'border-brand' : 'border-danger') : 'border-line'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[15px] font-bold text-ink">{r.name}</span>
              <span className="text-[13px] text-muted tabular-nums">{r.calc}</span>
            </div>
            <span
              className={`text-[40px] leading-none font-extrabold tracking-tight tabular-nums ${
                submitted ? (r.ok ? 'text-brand-text' : 'text-danger-text') : 'text-disabled'
              }`}
            >
              {submitted ? r.pct : 0}%
            </span>
            <div className="relative h-3 rounded-full bg-soft">
              <motion.div
                className={`h-full rounded-full ${submitted ? (r.ok ? 'bg-brand' : 'bg-danger') : 'bg-disabled'}`}
                initial={animate ? { width: '0%' } : false}
                animate={{ width: `${submitted ? r.pct : 0}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              <div aria-hidden="true" className="absolute -top-1 -bottom-1 w-0.5 bg-ink" style={{ left: '80%' }} />
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[14px] font-semibold ${
                submitted ? (r.ok ? 'text-brand-text' : 'text-danger-text') : 'text-muted'
              }`}
            >
              {submitted &&
                (r.ok ? (
                  <Check aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={3} />
                ) : (
                  <X aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={3} />
                ))}
              {submitted ? r.result : '통계 제출 전'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const REJECTS = [
  { before: '운영보전금을 청소비로 지급', text: '운영보전금을 청소비로 지급 — 승인된 용도에만 사용', code: 'BucketNotAllowed' },
  {
    before: '시설개선비를 고른 아파트 1동의 운영보전금 요청',
    text: '시설개선비를 고른 아파트 1동의 운영보전금 요청 — 지원 방식은 하나만',
    code: 'NotMonthlyMember',
  },
]

function Rejects({ done }: { done: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {REJECTS.map((r) =>
        done ? (
          <div key={r.code} className="flex items-start gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-[14px] text-ink">
            <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={3} />
            <p className="leading-snug">
              <span className="font-semibold text-danger-text">거부</span> · {r.text}
            </p>
          </div>
        ) : (
          <div key={r.code} className="rounded-2xl border border-line px-4 py-3 text-[14px] text-ink-2">
            {r.before}
          </div>
        ),
      )}
    </div>
  )
}

function Facility({ paid }: { paid: number }) {
  const items = [
    '주민 투표 3분의 2(20세대) 이상 동의',
    '구청 등록 시공 업체',
    '기준 금액(최대 3,000만 원) 이내',
    '공사 확인',
  ]
  const confirmed = paid > 0
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[16px] font-bold text-ink">가상 아파트 1동 · 시설개선비</span>
        <Tag>가상 직접 지급 모델 · 현행은 신청인 사후 지급</Tag>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((it, i) => {
          const ok = i < items.length - 1 || confirmed
          return (
            <li key={it} className="flex items-center gap-2 text-[14px] text-ink">
              {ok ? (
                <Check aria-hidden="true" className="size-4 text-brand" strokeWidth={3} />
              ) : (
                <Clock aria-hidden="true" className="size-4 text-muted" />
              )}
              <span className={ok ? '' : 'text-muted'}>{it}</span>
            </li>
          )
        })}
      </ul>
      <div className="flex items-end justify-between border-t border-line-soft pt-3">
        <span className="text-[14px] text-muted">
          시공 업체
          <span className="block text-[13px]">750만 원 + 5면 × 30만 원</span>
        </span>
        <span className={`text-[32px] leading-none font-extrabold tracking-tight ${confirmed ? 'text-brand-text' : 'text-ink'}`}>
          {confirmed ? '+' : ''}
          <CountUp value={paid} />
          <span className="ml-1 text-lg font-semibold text-muted">원</span>
        </span>
      </div>
    </div>
  )
}

function Buckets() {
  const rows = [
    { label: '공유 수익', code: 'PARKING_REVENUE', sub: '주민이 정한 사용처만', amount: DISTRICT.parkingBalance },
    { label: '운영보전금', code: 'SUBSIDY_OPERATING', sub: '사업 지침 용도 · 자동 지급 금지', amount: DISTRICT.subsidy },
    { label: '지역 인센티브(가상)', code: 'INCENTIVE_HYPOTHETICAL', sub: '구청 승인분', amount: DISTRICT.incentive },
  ]
  const total = rows.reduce((a, r) => a + r.amount, 0)
  return (
    <div className="flex flex-col">
      <ul className="flex flex-col">
        {rows.map((r) => (
          <li key={r.code} className="flex items-start gap-3 border-b border-line-soft py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold text-ink">{r.label}</p>
              <p className="text-[13px] text-muted">
                {r.sub}
              </p>
            </div>
            <span className="text-[17px] font-bold text-ink tabular-nums">{num(r.amount)}원</span>
          </li>
        ))}
      </ul>
      <div className="flex items-end justify-between pt-4">
        <span className="text-[15px] text-muted">합계</span>
        <span className="text-4xl font-extrabold tracking-tight text-ink tabular-nums">
          {num(total)}
          <span className="ml-1 text-lg font-semibold text-muted">원</span>
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        공유 수익은 시연 A 이후 잔액 · 버킷은 테스트넷 안의 회계적 구분이며 신탁 등 법적 효과를 보증하지 않습니다.
      </p>
    </div>
  )
}
