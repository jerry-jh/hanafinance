'use client'

import { motion, useTransform } from 'framer-motion'
import { useScrollTheme } from './scroll-theme'

export function SiteFooter() {
  const { dark } = useScrollTheme()
  const barBg = useTransform(dark, [0, 1], ['rgba(255,255,255,0.92)', 'rgba(25,31,40,0.92)'])
  const barLine = useTransform(dark, [0, 1], ['#f2f4f6', '#333d4b'])

  return (
    <>
      <footer className="border-t border-line px-5 pt-14 pb-24">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[16px] font-bold text-ink">인하대학교 × 하나금융TI 산학 프로젝트</p>
          <p className="mt-2 max-w-[760px] text-[14px] leading-relaxed text-muted">
            {"서버가 역할별 키로 대신 서명하는 계정은 '모의 역할 계정'이며, 기관이 독립적으로 승인했다는 증거가 아니에요. 테스트넷 투표는 관리단 결의를 대신하지 않아요."}
          </p>
        </div>
      </footer>
      <motion.div
        role="note"
        style={{ backgroundColor: barBg, borderColor: barLine }}
        className="fixed inset-x-0 bottom-0 z-50 flex h-9 items-center justify-center truncate border-t px-4 text-center text-[12.5px] text-muted-2 backdrop-blur"
      >
        GIWA Sepolia · TestKRW(실제 예금 아님) · 시뮬레이션·가상 인센티브 · 프로젝트 한강과 직접 연동 없음
      </motion.div>
    </>
  )
}
