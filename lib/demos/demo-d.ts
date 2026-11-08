import type { BaseState, Demo, Scene } from './types'

// 토큰증권으로 검증하는 것은 두 가지: ① 자격 없는 지갑으로의 양도 차단 ② 발전 수입의 지급 순서 집행.
// 대금·권리 동시 교환은 "예금토큰이 토큰증권 결제에 쓰일 수 있는지 확인하는 장면"으로만 남긴다(선택, 마지막).

export interface DemoDState extends BaseState {
  reserve: number
  normalDone: boolean
  stressDone: boolean
  deferred: number
  transferRejected: boolean
  dvpDone: boolean
}

export type WaterfallKey = 'normal' | 'stress'

export type DemoDVisual =
  | { type: 'waterfall'; key: WaterfallKey }
  | { type: 'transferReject' }
  | { type: 'dvp' }

export interface WaterfallRow {
  label: string
  sub: string
  value: number
  tone: 'ink' | 'ink-2' | 'sub' | 'muted' | 'brand' | 'withdraw' | 'defer'
  tag?: string
}

export const RESERVE_START = 583_245_134
export const RESERVE_AFTER_STRESS = 411_132_995
export const RESIDENT_DUE = 205_740_267

export const WATERFALL: Record<
  WaterfallKey,
  { inputLabel: string; input: number; reserve: [number, number]; rows: WaterfallRow[]; note?: string }
> = {
  normal: {
    inputLabel: '6년차 모의 발전 수입',
    input: 1_412_059_354,
    reserve: [RESERVE_START, RESERVE_START],
    rows: [
      { label: '운영비', sub: '운영비 지갑', value: 171_562_500, tone: 'ink' },
      { label: '정책융자', sub: '정책자금 상환 지갑', value: 960_750_000, tone: 'ink-2' },
      { label: '준비금 적립', sub: '준비금 지갑', value: 0, tone: 'sub' },
      { label: '주민 사채', sub: '권리 기준일 보유자 지갑', value: RESIDENT_DUE, tone: 'brand' },
      { label: '잔액 (출자 배당)', sub: '출자자 배당 지갑', value: 74_006_587, tone: 'muted' },
    ],
  },
  stress: {
    inputLabel: '6년차 모의 발전 수입 (발전량 −15%, 단가 −20%)',
    input: 960_200_361,
    reserve: [RESERVE_START, RESERVE_AFTER_STRESS],
    rows: [
      { label: '운영비', sub: '운영비 지갑', value: 171_562_500, tone: 'ink' },
      { label: '정책융자', sub: '정책자금 상환 지갑', value: 960_750_000, tone: 'ink-2' },
      { label: '준비금 인출', sub: '정책융자 부족분을 준비금에서 충당', value: 172_112_139, tone: 'withdraw', tag: '인출' },
      { label: '주민 사채', sub: '권리 기준일 보유자 지갑', value: 0, tone: 'defer', tag: '다음 회차로 이연' },
      { label: '잔액 (출자 배당)', sub: '출자자 배당 지갑', value: 0, tone: 'muted' },
    ],
  },
}

// 권리 기준일 명부 (모의)
export const REGISTRY = [
  { holder: '주민 A', amount: 1_000_000 },
  { holder: '주민 B', amount: 2_000_000 },
  { holder: '주민 C', amount: 3_000_000 },
]

export const TRANSFER_ATTEMPT = { from: '주민 A', to: '허용 목록 외 지갑', amount: 500_000 }

export const DVP = { who: '주민 A', amount: 1_000_000 }

type S = Scene<DemoDState, DemoDVisual>

const scenes: S[] = [
  {
    id: 'd-1',
    noSheet: true,
    chapter: '지급 순서 실행',
    kind: 'success',
    role: '하나은행',
    time: '6년차 정산',
    short: '발전 수입이 들어오면, 정해진 순서(조건)대로 지급',
    headline: '운영비 → 정책융자 → 준비금 적립 → 주민 사채 → 잔액(출자 배당) 순서로 나뉩니다.',
    actionLabel: '지급 순서 실행',
    durationMs: 3600,
    visual: { type: 'waterfall', key: 'normal' },
    logs: [
      {
        title: '6년차 지급 순서 실행',
        call: 'RevenueWaterfall.distribute(6, 1,412,059,354)',
        result: '운영비 171,562,500 → 정책융자 960,750,000 → 준비금 적립 0 → 주민 사채 205,740,267 → 잔액(출자 배당) 74,006,587',
        kind: 'success',
        amount: 1_412_059_354,
      },
    ],
    doneTitle: '지급됐어요',
    results: [{ tone: 'ok', text: '주민 사채 205,740,267원 · 잔액(출자 배당) 74,006,587원' }],
    apply: (s) => ({ ...s, normalDone: true, reserve: RESERVE_START }),
  },
  {
    id: 'd-2',
    noSheet: true,
    chapter: '수입 악화',
    kind: 'unlock',
    role: '하나은행',
    time: '6년차 정산 (악화 가정)',
    short: '수입 악화 시, 정해진 순서대로 준비금 인출 · 주민 원리금 이연',
    headline: '정책융자 부족분은 준비금에서 인출하고, 주민 원리금은 다음 회차로 이연합니다.',
    actionLabel: '악화 회차 실행',
    durationMs: 3800,
    visual: { type: 'waterfall', key: 'stress' },
    logs: [
      {
        title: '6년차 지급 순서 · 준비금 인출',
        call: 'RevenueWaterfall.distribute(6, 960,200,361)',
        result: '정책융자 부족분 172,112,139 준비금 인출 · 준비금 583,245,134 → 411,132,995 · 주민 원리금 205,740,267 이연',
        kind: 'success',
        amount: 172_112_139,
      },
    ],
    doneTitle: '이연됐어요',
    results: [
      { tone: 'reject', text: '주민 원리금 지급 0 · 205,740,267원 다음 회차로 이연' },
    ],
    apply: (s) => ({ ...s, stressDone: true, reserve: RESERVE_AFTER_STRESS, deferred: RESIDENT_DUE }),
  },
  {
    id: 'd-3',
    noSheet: true,
    chapter: '양도 거부',
    kind: 'reject',
    role: '조건 미충족 시',
    time: '권리 양도',
    heading: '자격 없는 지갑으로의 [권리 양도 차단]',
    short: '허용 목록 외 지갑으로는 권리 양도 불가',
    headline: '허용 목록에 없는 지갑으로 권리토큰을 직접 보내면 실패하고, 기준일 명부는 그대로입니다.',
    actionLabel: '권리토큰 전송 시도',
    visual: { type: 'transferReject' },
    logs: [
      {
        title: '권리토큰 직접 전송 실패',
        call: 'MockRightsToken.transfer(허용 목록 외 지갑, 500,000) · 고정 가스 한도',
        result: '허용 목록 외 지갑 — 전송 실패 · 기준일 명부 유지 · 탐색기 실패 기록',
        kind: 'reject',
        code: 'NotEligible',
        amount: TRANSFER_ATTEMPT.amount,
      },
    ],
    doneTitle: '보낼 수 없어요',
    results: [{ tone: 'reject', text: '실패 · 허용 목록 외 지갑 · 기준일 명부 그대로' }],
    apply: (s) => ({ ...s, transferRejected: true }),
  },
]

function initialState(): DemoDState {
  return {
    records: [],
    deposited: 0,
    minted: 0,
    reserve: RESERVE_START,
    normalDone: false,
    stressDone: false,
    deferred: 0,
    transferRejected: false,
    dvpDone: false,
  }
}

export const demoD: Demo<DemoDState, DemoDVisual> = {
  id: 'd',
  letter: 'D',
  chipLabel: '햇빛 발전',
  title: '시연 D · 햇빛 발전 주민 투자의 권리 관리',
  scenes: () => scenes,
  initialState,
}
