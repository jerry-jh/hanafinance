'use client'

import { Check, Equal, ShieldCheck, Users } from 'lucide-react'
import { useScrollStep } from '@/hooks/useScrollStep'
import { Disclosure } from './disclosure'

const ROWS = [
  { icon: ShieldCheck, title: '규칙 밖으로는 1원도 안 나가요', sub: '정하지 않은 곳으로의 지급은 계약이 거부해요' },
  { icon: Users, title: '혼자서는 집행할 수 없어요', sub: '주민·운영사·은행 승인이 모두 있어야 해요' },
  { icon: Equal, title: '모두가 같은 기록을 봐요', sub: '주민·은행·구청이 같은 거래를 확인해요' },
]

const COMPARE = [
  ['주민이 정한 청소비 지급', '서버에 투표·승인 저장 후 송금 API', '계약이 승인 정책·수취인을 확인한 뒤 이전'],
  ['선결제 월별 정산', '운영사 장부에 기간별 미지급금 기록', '잠긴 토큰을 월별로 해제, 기간 전 지급은 거부'],
  ['공유 지원 · 연계 인센티브', '기관별 DB 대조 후 결재·계좌이체', '예산·적격·기관 승인을 계약이 검증'],
  ['햇빛 발전 모의 투자', '계좌 납입과 증권 기록을 따로 처리', '대금과 권리토큰을 동시에 교환'],
]

export function WhySection() {
  const { ref, step, reduce } = useScrollStep(ROWS.length)

  return (
    <section id="why" className="scroll-mt-[60px] px-5 text-white">
      <div ref={ref} className={reduce ? 'py-28' : 'h-[250vh]'}>
        <div
          className={
            reduce ? '' : 'sticky top-[60px] flex h-[calc(100svh-60px)] flex-col items-center justify-center'
          }
        >
          <div className="mx-auto w-full max-w-[760px]">
            <div className="flex flex-col items-center text-center">
              <p className="text-[16px] font-bold text-[#4fd18b]">Why 모의 예금토큰?</p>
              <h2 className="mt-3 text-[36px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[52px]">
                돈에 규칙이 붙어 있어요
              </h2>
            </div>
            <ul className="mt-14 flex flex-col">
              {ROWS.map(({ icon: Icon, title, sub }, i) => (
                <li
                  key={title}
                  aria-current={i === step ? 'step' : undefined}
                  className={`flex items-center gap-5 border-b border-ink-2 py-6 transition-opacity duration-500 ${
                    reduce || i === step ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ink-2">
                    <Icon aria-hidden="true" className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="text-[20px] font-bold sm:text-[22px]">{title}</p>
                    <p className="mt-1 text-[16px] text-disabled">{sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[760px] pb-28">
        <Disclosure label="기존 계좌 방식과 비교" tone="dark">
          <div className="overflow-x-auto rounded-3xl border border-ink-2">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-ink-2 text-[14px] text-muted-2">
                  <th scope="col" className="px-5 py-3 font-semibold">같은 업무</th>
                  <th scope="col" className="px-5 py-3 font-semibold">기존 계좌 · API 방식</th>
                  <th scope="col" className="px-5 py-3 font-semibold">모의 예금토큰 방식</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([task, legacy, token]) => (
                  <tr key={task} className="border-b border-ink-2 last:border-b-0">
                    <th scope="row" className="px-5 py-4 font-semibold text-white">{task}</th>
                    <td className="px-5 py-4 text-disabled">{legacy}</td>
                    <td className="px-5 py-4 text-white">
                      <span className="inline-flex items-start gap-1.5">
                        <Check aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-[#4fd18b]" strokeWidth={3} />
                        {token}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-[14px] text-muted-2">
            기존 방식도 같은 조건에서 같은 결과를 낸다면 해당 거래는 기존 방식을 유지해요.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
