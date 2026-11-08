'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { LedgerRecord } from '@/lib/demos/types'
import { num } from '@/lib/format'

export function RecordSheet({ record, onClose }: { record: LedgerRecord | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!record) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [record, onClose])

  return (
    <AnimatePresence>
      {record && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-sheet-title"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[620px] rounded-t-[28px] bg-white px-6 pt-3 pb-14 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[14px] text-muted">자세히</p>
                <h3 id="record-sheet-title" className="text-[24px] font-extrabold tracking-tight text-ink">
                  {record.title}
                </h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="flex size-9 items-center justify-center rounded-full bg-soft text-sub hover:bg-line"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-sub">{record.headline}</p>
            <dl className="mt-4 flex flex-col text-[15px]">
              <Row label="역할" value={`${record.role} (모의 역할 계정)`} />
              <Row label="시각" value={record.time} />
              <Row
                label="결과"
                value={
                  record.kind === 'reject'
                    ? `거부 · ${record.result}`
                    : record.kind === 'offchain'
                      ? `오프체인 · ${record.result}`
                      : `완료 · ${record.result}`
                }
              />
              {typeof record.amount === 'number' && (
                <Row
                  label="금액"
                  value={record.kind === 'offchain' ? `${num(record.amount)}원` : `${num(record.amount)} TestKRW (실제 예금 아님)${record.kind === 'reject' ? ' · 이전되지 않음' : ''}`}
                />
              )}
            </dl>
            {record.kind === 'reject' && (
              <p className="mt-3 text-[13px] text-muted">
                거부된 거래는 체인에 이벤트를 남기지 않아요. 이 기록은 시연 화면의 실행 기록이에요.
              </p>
            )}
            {record.kind !== 'offchain' && (
              <button
                type="button"
                disabled
                title="배포 후 연결"
                aria-label="익스플로러에서 보기 (배포 후 연결)"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-soft px-3 py-2 text-[14px] text-muted"
              >
                익스플로러에서 보기
                <ExternalLink aria-hidden="true" className="size-3.5" />
                <span className="text-[13px]">· 배포 후 연결</span>
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-4 border-b border-line-soft py-2.5 last:border-b-0">
      <dt className="w-20 shrink-0 text-muted">{label}</dt>
      <dd className={`min-w-0 flex-1 break-all text-ink ${mono ? 'font-mono text-[13px] leading-6' : ''}`}>{value}</dd>
    </div>
  )
}
