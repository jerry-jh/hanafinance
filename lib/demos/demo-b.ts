import type { BaseState, Demo, Scene } from './types'

export type MonthKey = 'oct' | 'nov' | 'dec'
export type SlotStatus = 'none' | 'locked' | 'paid' | 'unlocked'

export const MONTHS: { key: MonthKey; label: string }[] = [
  { key: 'oct', label: '10월분' },
  { key: 'nov', label: '11월분' },
  { key: 'dec', label: '12월분' },
]

export interface DemoBState extends BaseState {
  settled: boolean
  slots: Record<MonthKey, SlotStatus>
  locked: number
  cleaner: number
}

export type DemoBVisual =
  | { type: 'calc' }
  | { type: 'slots'; flashReject?: MonthKey; note?: string; refund?: number }

export const PREPAID = {
  payment: 120_000,
  pgFee: 3_600,
  net: 116_400,
  share: 69_840,
  miyuol: 46_560,
  month: 23_280,
}

const DETAIL = '지급 조건은 결제한 예약 기간의 종료이며 실제 입출차 여부는 보지 않습니다.'

type S = Scene<DemoBState, DemoBVisual>

const scenes: S[] = [
  {
    id: 'b-2',
    chapter: '선결제분 월별로 구분',
    kind: 'success',
    role: '하나은행 · 미유올',
    time: '2026.10.05 09:00',
    short: '이용자가 3개월치 선결제 한 경우\n건물의 정산금을 월별로 구분하여 보관',
    headline: '3개월분 건물 몫을 잠긴 예금토큰으로 전환하고 달별 세 칸으로 나눕니다.',
    actionLabel: '잠금 실행',
    visual: { type: 'slots' },
    logs: [
      {
        title: '예금토큰 전환',
        call: 'BankDesk.convert(PP-1027)',
        result: 'TestKRW 69,840 발행',
        kind: 'success',
        amount: PREPAID.share,
      },
      {
        title: '선결제 잠금',
        call: 'SettlementVault.lockPrepaid(PP-1027, VILLA-1, 2026-10, 3개월)',
        result: '선결제 잠금 · 각 23,280',
        kind: 'success',
        amount: PREPAID.share,
      },
    ],
    doneTitle: '잠갔어요',
    sheetBalance: '잠긴 잔액 69,840원',
    results: [{ tone: 'ok', text: '69,840원 잠금 · 10월분 · 11월분 · 12월분 각 23,280원' }],
    apply: (s) => ({
      ...s,
      deposited: s.deposited + PREPAID.share,
      minted: s.minted + PREPAID.share,
      settled: true,
      slots: { oct: 'locked', nov: 'locked', dec: 'locked' },
      locked: PREPAID.share,
    }),
  },
  {
    id: 'b-3',
    chapter: '10월 사용 완료',
    kind: 'success',
    role: '하나은행',
    time: '2026.11.05 09:05',
    short: '10월 사용이 완료되면',
    headline: '10월 예약 기간이 끝났으므로 10월 몫만 풀려 지급됩니다.',
    actionLabel: '지급일 실행',
    visual: { type: 'slots' },
    logs: [
      {
        title: '10월분 지급',
        call: 'SettlementVault.releaseMonth(PP-1027, 2026-10)',
        result: '10월분 23,280 → 청소 업체 · 잠긴 잔액 46,560',
        kind: 'success',
        amount: PREPAID.month,
      },
    ],
    doneTitle: '보냈어요',
    sheetBalance: '잠긴 잔액 46,560원',
    sheetNote: DETAIL,
    results: [{ tone: 'ok', text: '10월분 23,280원 → 청소 업체', chip: '청소비 지급' }],
    apply: (s) => ({
      ...s,
      slots: { ...s.slots, oct: 'paid' },
      locked: s.locked - PREPAID.month,
      cleaner: s.cleaner + PREPAID.month,
    }),
  },
  {
    id: 'b-5',
    noSheet: true,
    chapter: '12월분 중도 해지',
    kind: 'unlock',
    role: '미유올',
    time: '2026.11.25 15:00',
    short: '12월 예약분을 중간에 해지하면',
    headline: '이용자가 해지하자 아직 시작되지 않은 12월 몫의 잠금이 풀립니다.',
    actionLabel: '해지 처리',
    visual: {
      type: 'slots',
      refund: PREPAID.month,
    },
    logs: [
      {
        title: 'PG 취소 기록',
        call: 'SettlementVault.recordPgCancel(PP-1027, …)',
        result: '원결제 취소 정보와 일치',
        kind: 'success',
      },
      {
        title: '선결제 해지',
        call: 'SettlementVault.cancelPrepaid(PP-1027)',
        result: '12월분 23,280 잠금 해제',
        kind: 'success',
        amount: PREPAID.month,
      },
    ],
    doneTitle: '잠금을 풀었어요',
    sheetBalance: '잠긴 잔액 23,280원',
    results: [{ tone: 'ok', text: '12월분 23,280원 잠금 해제 · 환불 재원' }],
    apply: (s) => ({
      ...s,
      slots: { ...s.slots, dec: 'unlocked' },
      locked: s.locked - PREPAID.month,
    }),
  },
]

function initialState(): DemoBState {
  return {
    records: [],
    deposited: 0,
    minted: 0,
    settled: false,
    slots: { oct: 'none', nov: 'none', dec: 'none' },
    locked: 0,
    cleaner: 0,
  }
}

export const demoB: Demo<DemoBState, DemoBVisual> = {
  id: 'b',
  letter: 'B',
  chipLabel: '이용 정산',
  title: '시연 B · 3개월치를 미리 내도, 건물엔 끝난 달 몫만 지급돼요',
  scenes: () => scenes,
  initialState,
  detailNote: DETAIL,
}
