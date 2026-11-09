'use client'

import { ArrowRight, Check, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useScrollStep } from '@/hooks/useScrollStep'
import { Disclosure } from './disclosure'

function Pill({ children, className = 'text-ink' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-2xl border border-line-soft bg-white px-4 py-2.5 text-[17px] font-bold shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:text-[19px] ${className}`}
    >
      {children}
    </span>
  )
}

const Arrow = () => <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-disabled" />

const BOXES = [
  { title: '역할 화면', body: '주민 · 건물 대표 · 미유올 · 은행 · 구청 · 업체', mono: false },
  {
    title: 'GIWA Sepolia 스마트계약',
    body: 'BuildingGovernance · SettlementVault · IncentiveDistributor · BankDesk',
    mono: true,
  },
  { title: '모의 예금토큰', body: 'TestKRW → 지갑', mono: false },
]

const STEPS = 5

export function FlowSection() {
  const { ref, step, reduce } = useScrollStep(STEPS)
  const lit = (i: number) => `transition-all duration-500 ${i <= step ? 'opacity-100' : 'opacity-30'}`
  const branchesShown = step >= 4

  return (
    <section id="flow" className="scroll-mt-[60px] px-5">
      <div ref={ref} className={reduce ? 'py-28' : 'h-[200vh]'}>
        <div
          className={
            reduce ? '' : 'sticky top-[60px] flex h-[calc(100svh-60px)] flex-col items-center justify-center'
          }
        >
          <div className="mx-auto w-full max-w-[1180px]">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-[36px] leading-tight font-extrabold tracking-[-0.03em] text-ink sm:text-[52px]">
                흐름
              </h2>
            </div>
            <ol
              className="mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-3"
              aria-label="시연 흐름"
            >
              <li className={lit(0)}><Pill>재원 발생</Pill></li>
              <li aria-hidden="true" className={lit(1)}><Arrow /></li>
              <li className={lit(1)}><Pill>모의 예금토큰 전환</Pill></li>
              <li aria-hidden="true" className={lit(2)}><Arrow /></li>
              <li className={lit(2)}><Pill>조건 확인</Pill></li>
              <li aria-hidden="true" className={lit(4)}><Arrow /></li>
              <li
                className={`flex items-center gap-2 transition-all duration-500 ${
                  branchesShown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
                }`}
              >
                <Pill className="text-brand-text">
                  <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                  지급
                </Pill>
                <span aria-hidden="true" className="text-disabled">/</span>
                <Pill className="text-danger-text">
                  <X aria-hidden="true" className="size-4" strokeWidth={3} />
                  거부
                </Pill>
              </li>
              <li aria-hidden="true" className={lit(3)}><Arrow /></li>
              <li className={lit(3)}><Pill>내역 확인</Pill></li>
            </ol>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[960px] pb-28">
        <Disclosure label="기술 구조 보기">
          <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
            {BOXES.map((b, i) => (
              <div key={b.title} className="contents">
                <div className="flex-1 rounded-3xl border border-line-soft bg-soft-2 px-5 py-5 text-center">
                  <p className="text-[16px] font-bold text-ink">{b.title}</p>
                  <p className={`mt-2 text-sub ${b.mono ? 'font-mono text-[13px] leading-6' : 'text-[15px]'}`}>
                    {b.body}
                  </p>
                </div>
                {i < BOXES.length - 1 && (
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 self-center text-disabled max-md:rotate-90" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[17px] font-bold text-ink">
            주민 가결 + 미유올 정산 확정 + 은행 전환 = 지급
          </p>
          <p className="mx-auto mt-3 max-w-[640px] text-center text-[14px] leading-relaxed text-muted">
            예약·결제·PG 수수료·60:40 계산은 오프체인 기존 정산시스템이 처리하고, 확정된 건물 몫과 정산 ID만
            계약에 제출해요.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
