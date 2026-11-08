import type { BaseState, Demo, Scene } from './types'

export interface DemoDState extends BaseState {
  subscribed: number
  dRejected: boolean
  revenue: number
  year1: boolean
  year6: boolean
  reserve: number
  transferE: boolean
  transferF: boolean
}

export type DemoDVisual =
  | { type: 'subscribe'; showD?: boolean }
  | { type: 'revenue' }
  | { type: 'waterfall'; year: 1 | 6 }
  | { type: 'transfer' }

export const SUBSCRIBERS = [
  { id: 'A', amount: 1_000_000, annual: 89_941 },
  { id: 'B', amount: 2_000_000, annual: 179_882 },
  { id: 'C', amount: 3_000_000, annual: 269_823 },
]

export const SUB_TOTAL = 6_000_000
export const ANNUAL_TOTAL = 539_646

export interface WaterfallRow {
  label: string
  sub: string
  value: number
  tone: 'ink' | 'ink-2' | 'sub' | 'muted' | 'brand' | 'withdraw'
  tag?: string
}

export const WATERFALL: Record<1 | 6, { inputLabel: string; input: number; reserve: [number, number]; rows: WaterfallRow[] }> = {
  1: {
    inputLabel: '1년차 판매대금',
    input: 231_663_456,
    reserve: [0, 24_739_693],
    rows: [
      { label: '필수 운영비', sub: '운영비 지갑 · 유지보수·보험·부지 사용료', value: 18_000_000, tone: 'ink' },
      { label: '정책융자 원리금', sub: '정책자금 상환 지갑', value: 18_000_000, tone: 'ink-2' },
      { label: '채무상환 준비금 적립', sub: '준비금 지갑', value: 24_739_693, tone: 'sub' },
      { label: '주민 투자자 원리금', sub: '권리 기준일 보유자 지갑', value: 31_479_385, tone: 'brand' },
      { label: '잔여액', sub: '공동 관리 재원 지갑', value: 139_444_378, tone: 'muted' },
    ],
  },
  6: {
    inputLabel: '6년차 판매대금(악화 가정)',
    input: 153_632_058,
    reserve: [65_840_000, 61_992_673],
    rows: [
      { label: '필수 운영비', sub: '운영비 지갑', value: 18_000_000, tone: 'ink' },
      { label: '정책융자 원리금', sub: '정책자금 상환 지갑', value: 108_000_000, tone: 'ink-2' },
      { label: '준비금 인출', sub: '부족분을 준비금에서 충당', value: 3_847_327, tone: 'withdraw', tag: '인출' },
      { label: '주민 투자자 원리금', sub: '권리 기준일 보유자 지갑', value: 31_479_385, tone: 'brand', tag: '✓ 전액 지급' },
      { label: '잔여액', sub: '공동 관리 재원 지갑', value: 0, tone: 'muted' },
    ],
  },
}

const INTRO_NOTE = '학익유수지 1.2MW · 11월 4일 설계안(가정) · 모의 투자자 권리토큰 · 실제 증권 아님 · 수익률 미표시'
const MODEL_NOTE =
  '기와 테스트넷에서 모의 지급토큰과 투자자 권리토큰의 원자적 교환을 구현한 참조모델입니다. 같은 체인 안의 두 계약은 독립된 두 원장이 아닙니다. 수지표는 공개 자료 기반 시연용 산정값입니다.'

type S = Scene<DemoDState, DemoDVisual>

const scenes: S[] = [
  {
    id: 'd-1',
    chapter: '주민 A·B·C 청약',
    kind: 'success',
    role: '주민 · 하나은행',
    time: '청약',
    short: '대금 권리 교환',
    headline: '주민이 모의 예금토큰을 내면 같은 거래 안에서 권리토큰이 지급됩니다.',
    actionLabel: '청약 실행',
    durationMs: 4000,
    visual: { type: 'subscribe' },
    logs: SUBSCRIBERS.map((r) => ({
      title: `주민 ${r.id} 청약 · 동시 교환`,
      call: `SubscriptionDvP.subscribe(SOLAR-1, SUB-${r.id}, ${r.amount.toLocaleString('ko-KR')})`,
      result: `TestKRW ${r.amount.toLocaleString('ko-KR')} ⇄ 권리토큰 ${r.amount.toLocaleString('ko-KR')}`,
      kind: 'success' as const,
      amount: r.amount,
    })),
    doneTitle: '교환됐어요',
    sheetNote: INTRO_NOTE,
    results: [{ tone: 'ok', text: '합계 6,000,000 ⇄ 권리 6,000,000 · 연 원리금 합계 539,646' }],
    apply: (s) => ({ ...s, subscribed: SUBSCRIBERS.length }),
  },
  {
    id: 'd-2',
    chapter: '주민 D 한도 초과',
    kind: 'reject',
    role: '주민 D (예외)',
    time: '청약',
    short: '한도 초과 시, 청약 거부',
    headline: '1인 한도 500만 원을 넘는 청약은 대금과 권리 모두 움직이지 않습니다.',
    actionLabel: '600만 원 청약 시도',
    visual: { type: 'subscribe', showD: true },
    logs: [
      {
        title: '주민 D 청약 거부',
        call: 'SubscriptionDvP.subscribe(SOLAR-1, SUB-D, 6,000,000)',
        result: '1인 한도(500만 원) 초과 — 대금·권리토큰 잔액 모두 변동 없음',
        kind: 'reject',
        code: 'PerPersonCapExceeded',
        amount: 6_000_000,
      },
    ],
    doneTitle: '청약할 수 없어요',
    sheetResults: [{ tone: 'reject', text: '거부 · 1인 한도(500만 원) 초과', code: 'PerPersonCapExceeded' }],
    sheetBalance: '대금·권리토큰 잔액 모두 변동 없음',
    apply: (s) => ({ ...s, dRejected: true }),
  },
  {
    id: 'd-3',
    chapter: '판매 대금 확정',
    kind: 'success',
    role: '발전사업자 · 하나은행',
    time: '1년차 정산',
    short: '전력 판매 대금 결정',
    headline: '정산서·계약가격·입금내역이 일치한 판매대금만 다음 단계로 갑니다.',
    actionLabel: '판매대금 확정',
    visual: { type: 'revenue' },
    checks: [
      { label: '정산서', ok: true },
      { label: '계약가격', ok: true },
      { label: '입금내역', ok: true, code: 'RevenueWaterfall' },
    ],
    logs: [
      {
        title: '권리 기준일 명부 확정',
        call: 'MockRightsToken.fixRecordDate(1)',
        result: '권리 기준일 명부 확정',
        kind: 'success',
      },
      {
        title: '1년차 판매대금 확정',
        call: 'RevenueWaterfall.confirmRevenue(1, …, 231,663,456)',
        result: '정산서 · 계약가격 · 입금내역 일치 · 231,663,456',
        kind: 'success',
        amount: 231_663_456,
      },
    ],
    doneTitle: '확정됐어요',
    sheetNote: MODEL_NOTE,
    apply: (s) => ({ ...s, revenue: 231_663_456 }),
  },
  {
    id: 'd-4',
    chapter: '지급 순서',
    kind: 'success',
    role: '하나은행',
    time: '1년차 정산',
    short: '규칙에 따른 순차적 지급',
    headline: '운영비 → 정책융자 → 준비금 → 주민 원리금 → 잔여액 순서로 지급됩니다.',
    actionLabel: '지급 순서 실행',
    durationMs: 3600,
    visual: { type: 'waterfall', year: 1 },
    logs: [
      {
        title: '1년차 지급 순서 실행',
        call: 'RevenueWaterfall.distribute(1)',
        result: '운영비 18,000,000 → 정책융자 18,000,000 → 준비금 24,739,693 → 주민 원리금 31,479,385 → 잔여액 139,444,378',
        kind: 'success',
        amount: 231_663_456,
      },
    ],
    doneTitle: '지급됐어요',
    results: [{ tone: 'ok', text: '주민 투자자 원리금 31,479,385원 · 잔여액 139,444,378원' }],
    apply: (s) => ({ ...s, year1: true, reserve: 24_739_693 }),
  },
  {
    id: 'd-5',
    chapter: '수익 악화의 경우',
    kind: 'unlock',
    role: '하나은행',
    time: '6년차 정산(악화 가정)',
    short: '수익 악화 시, 준비금으로 충당',
    headline: '발전량 15%·단가 20%가 줄어도 주민 원리금은 준비금으로 지급됩니다.',
    actionLabel: '악화 회차 실행',
    durationMs: 3800,
    visual: { type: 'waterfall', year: 6 },
    logs: [
      {
        title: '6년차 판매대금 확정',
        call: 'RevenueWaterfall.confirmRevenue(6, …, 153,632,058)',
        result: '발전량 15% · 단가 20% 감소 가정 · 153,632,058',
        kind: 'success',
        amount: 153_632_058,
      },
      {
        title: '6년차 지급 순서 · 준비금 인출',
        call: 'RevenueWaterfall.distribute(6)',
        result: '준비금 인출 3,847,327 → 주민 원리금 31,479,385 전액 지급 · 잔여액 0',
        kind: 'success',
        amount: 31_479_385,
      },
    ],
    doneTitle: '전액 지급됐어요',
    sheetBalance: '준비금 65,840,000 → 61,992,673',
    results: [{ tone: 'ok', text: '주민 원리금 31,479,385원 전액 지급 · 준비금 인출 3,847,327원' }],
    apply: (s) => ({ ...s, year6: true, reserve: 61_992_673 }),
  },
  {
    id: 'd-6',
    chapter: '권리 이전 · 확인 지갑',
    kind: 'success',
    role: '주민 A',
    time: '권리 이전',
    short: '본인 확인된 지갑으로 권리 이전',
    headline: '본인 확인된 지갑으로의 권리 이전은 성공합니다.',
    actionLabel: 'A → E 이전',
    visual: { type: 'transfer' },
    checks: [
      { label: '받는 지갑 E · 본인 확인', ok: true },
      { label: '권리 기준일 명부 갱신', ok: true, code: 'MockRightsToken' },
    ],
    logs: [
      {
        title: 'A → E 권리 이전',
        call: 'MockRightsToken.transfer(E, 500,000)',
        result: '본인 확인된 지갑 · 500,000 이전 완료',
        kind: 'success',
        amount: 500_000,
      },
    ],
    doneTitle: '옮겼어요',
    results: [{ tone: 'ok', text: 'A → E 500,000 이전 완료' }],
    apply: (s) => ({ ...s, transferE: true }),
  },
  {
    id: 'd-7',
    chapter: '권리 이전 · 미확인 거부',
    kind: 'reject',
    role: '주민 A (예외)',
    time: '권리 이전',
    short: '미확인 지갑으로는 못 옮겨요',
    headline: '미확인 지갑으로의 양도는 거부되고 기준일 명부는 그대로입니다.',
    actionLabel: 'A → F 이전 시도',
    visual: { type: 'transfer' },
    logs: [
      {
        title: 'A → F 권리 이전 거부',
        call: 'MockRightsToken.transfer(F, 500,000)',
        result: '미확인 지갑 — 기준일 명부 유지',
        kind: 'reject',
        code: 'NotEligible',
        amount: 500_000,
      },
    ],
    doneTitle: '옮길 수 없어요',
    sheetResults: [{ tone: 'reject', text: '거부 · 미확인 지갑 — 기준일 명부 유지', code: 'NotEligible' }],
    sheetNote: MODEL_NOTE,
    apply: (s) => ({ ...s, transferF: true }),
  },
]

function initialState(): DemoDState {
  return {
    records: [],
    deposited: 0,
    minted: 0,
    subscribed: 0,
    dRejected: false,
    revenue: 0,
    year1: false,
    year6: false,
    reserve: 0,
    transferE: false,
    transferF: false,
  }
}

export const demoD: Demo<DemoDState, DemoDVisual> = {
  id: 'd',
  letter: 'D',
  chipLabel: '햇빛 발전',
  title: '시연 D · 투자대금과 투자자 권리를 같은 거래에서 교환',
  scenes: () => scenes,
  initialState,
  detailNote: `${INTRO_NOTE} · ${MODEL_NOTE}`,
}
