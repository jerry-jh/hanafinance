'use client'

import { Check, X } from 'lucide-react'
import { useState } from 'react'
import type { BaseState, LedgerRecord } from '@/lib/demos/types'
import { num } from '@/lib/format'
import { RecordSheet } from './record-sheet'

export function Records({ state }: { state: BaseState | null }) {
  const [selected, setSelected] = useState<LedgerRecord | null>(null)
  const records = state?.records ?? []
  const matched = state ? state.deposited === state.minted : true

  return (
    <div id="records" className="scroll-mt-4">
      <h3 className="text-[22px] font-extrabold tracking-tight text-ink">거래 기록 · 성공과 거부, 모두 기록돼요</h3>
      {records.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white px-6 py-10 text-center text-[16px] text-muted">
          아직 기록된 거래가 없어요 · 시연을 실행하면 여기에 쌓여요
        </p>
      ) : (
        <ul className="mt-3 flex flex-col">
          {records.map((r) => (
            <li key={r.id} className="border-b border-line-soft">
              <button
                type="button"
                onClick={() => setSelected(r)}
                className="flex w-full items-center gap-4 rounded-xl py-3.5 text-left transition-colors hover:bg-white sm:px-2"
              >
                <RecordIcon kind={r.kind} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-semibold text-ink">{r.title}</p>
                  <p className="truncate font-mono text-[13px] text-muted">
                    {r.kind === 'reject' ? `${r.code} · status 0` : r.call}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {typeof r.amount === 'number' ? (
                    <span
                      className={`text-[16px] font-bold tabular-nums ${
                        r.kind === 'reject' ? 'text-muted-2 line-through' : 'text-ink'
                      }`}
                    >
                      {num(r.amount)}원
                    </span>
                  ) : (
                    <span className="text-[16px] font-bold text-ink">–</span>
                  )}
                  <span className="text-[13px] text-muted tabular-nums">{r.time}</span>
                </div>
                <div className="hidden w-24 shrink-0 flex-col items-end gap-1 sm:flex">
                  <StatusChip kind={r.kind} />
                  <span className="text-[13px] text-muted">{r.kind === 'offchain' ? '블록체인 밖' : '모의 거래'}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 flex flex-wrap items-center gap-x-2 text-[14px] text-sub tabular-nums">
        <span className="font-semibold text-ink-2">하나은행 대사</span>· 모의 입금 누계 {num(state?.deposited ?? 0)}원 ={' '}
        TestKRW 발행 누계 {num(state?.minted ?? 0)}원
        {matched ? (
          <span className="inline-flex items-center gap-1 font-semibold text-brand-text">
            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            일치
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-danger-text">
            <X aria-hidden="true" className="size-3.5" strokeWidth={3} />
            불일치
          </span>
        )}
      </p>
      <RecordSheet record={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function RecordIcon({ kind }: { kind: LedgerRecord['kind'] }) {
  if (kind === 'success')
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft">
        <Check aria-label="성공" className="size-4 text-brand" strokeWidth={3} />
      </span>
    )
  if (kind === 'reject')
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft">
        <X aria-label="거부" className="size-4 text-danger" strokeWidth={3} />
      </span>
    )
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-soft" aria-label="블록체인 밖">
      <span className="size-2 rounded-full bg-disabled" />
    </span>
  )
}

function StatusChip({ kind }: { kind: LedgerRecord['kind'] }) {
  if (kind === 'success')
    return <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[13px] font-semibold text-brand-text">완료</span>
  if (kind === 'reject')
    return <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-[13px] font-semibold text-danger-text">거부됨</span>
  return <span className="rounded-full bg-soft px-2.5 py-0.5 text-[13px] font-semibold text-sub">확정</span>
}
