import { demoA } from './demo-a'
import { demoB } from './demo-b'
import { demoC } from './demo-c'
import { demoD } from './demo-d'
import type { Demo } from './types'

export interface DemoEntry {
  letter: string
  chipLabel: string
  heading: string
  demo: Demo
}

export const DEMOS: DemoEntry[] = [
  { letter: 'A', chipLabel: '주민 합의', heading: '주민 투표로 정한 대로 공유 수익 집행', demo: demoA },
  { letter: 'B', chipLabel: '이용 정산', heading: '3개월 선결제 중 예약 기간이 지난 달 몫만 지급', demo: demoB },
  { letter: 'C', chipLabel: '구청 지원', heading: '구청 인센티브를 개방·이용 조건에 따라 지급', demo: demoC },
  { letter: 'D', chipLabel: '햇빛 발전', heading: '햇빛 발전 주민 투자의 권리 관리', demo: demoD },
]
