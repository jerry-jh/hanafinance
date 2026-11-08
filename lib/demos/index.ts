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
  { letter: 'A', chipLabel: '주민 합의', heading: '주민 투표로 정한 [조건에 따른] 공유 주차 수익 [자동 지급]', demo: demoA },
  { letter: 'B', chipLabel: '이용 정산', heading: '[조건부] 정산 [지급·잠금]', demo: demoB },
  { letter: 'C', chipLabel: '구청 지원', heading: '주민 투표로 선택한 지원금 수령 [조건에 따른 지급]', demo: demoC },
  { letter: 'D', chipLabel: '햇빛 발전', heading: '햇빛 발전 주민 투자의 권리 관리', demo: demoD },
]
