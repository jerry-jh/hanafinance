import type { BaseState, Demo, Scene } from './types'

export interface DemoCState extends BaseState {
  supportChosen: boolean
  openDays: number
  subsidyPaid: number
  usageSubmitted: boolean
  approved: boolean
  executed: boolean
  incentivePaid: number
  facilityPaid: number
}

export type DemoCVisual =
  | { type: 'options' }
  | { type: 'subsidy' }
  | { type: 'incentive' }
  | { type: 'hold' }
  | { type: 'compare' }
  | { type: 'rejects' }
  | { type: 'facility' }
  | { type: 'buckets' }

export const DISTRICT = {
  openSpaces: 5,
  soldSpaces: 4,
  subsidyPerSpace: 20_000,
  subsidy: 100_000,
  incentivePerSpace: 3_000,
  incentive: 12_000,
  facility: 9_000_000,
  heldSpaces: 3,
  heldSubsidy: 60_000,
  aptOpenSpaces: 10,
  aptSoldSpaces: 6,
  parkingBalance: 13_120,
  days: 31,
}

type S = Scene<DemoCState, DemoCVisual>

const scenes: S[] = [
  {
    id: 'c-1',
    chapter: '지원 방식 선택',
    kind: 'pass',
    role: '건물 대표 · 주민 투표 제2호',
    time: '2026.09.22 10:00',
    short: '주민 투표로 지원금 수령 방식 선택',
    headline: '주민 투표 제2호로 구청 지원 방식을 월별(운영보전금)로 정했습니다.',
    actionLabel: '투표 결과 확인',
    flash: true,
    visual: { type: 'options' },
    checks: [
      { label: '구분소유자 과반 (6/8명 ≥ 5명)', ok: true },
      { label: '의결권 과반 (75.0% > 50%)', ok: true },
      { label: '지원 방식은 하나만 선택', ok: true, code: 'BuildingGovernance' },
    ],
    logs: [
      {
        title: '지원 방식 안건 · 가결',
        call: 'BuildingGovernance.proposeSupport(VILLA-1, Monthly) → vote → close',
        result: '구청에 접수 · 월별 · 등록 5면',
        kind: 'success',
      },
    ],
    doneTitle: '가결됐어요',
    results: [{ tone: 'ok', text: '가결 · 6/8명 · 75% · 구청에 접수 · 월별 · 등록 5면' }],
    apply: (s) => ({ ...s, supportChosen: true }),
  },
  {
    id: 'c-2',
    noSheet: true,
    chapter: '공유 데이터 연결',
    kind: 'success',
    role: '미유올',
    time: '2026.11.04',
    short: '10월 공유 주차장 운영 데이터 확인',
    headline: '10월 한 달 동안 매일 5면이 판매 가능했는지 연결합니다.',
    actionLabel: '공유 데이터 연결',
    durationMs: 3400,
    visual: { type: 'subsidy' },
    logs: [
      {
        title: '10월 공유 데이터 연결',
        call: 'IncentiveDistributor.submitOpenData(VILLA-1, 2026-10, minOpen 5, dataHash)',
        result: '31/31일 · 최소 공유 5면 확인',
        kind: 'success',
      },
    ],
    doneTitle: '연결됐어요',
    apply: (s) => ({ ...s, openDays: DISTRICT.days }),
  },
  {
    id: 'c-3',
    noSheet: true,
    chapter: '운영 보전금',
    kind: 'success',
    role: '구청 → 하나은행',
    time: '2026.11.05 10:00',
    short: '조건 충족 확인에 따라, 운영 보전금 10만원 입금',
    headline: '공유 유지가 확인돼 운영보전금 100,000원이 지급됩니다.',
    actionLabel: '지급일 실행',
    visual: { type: 'subsidy' },
    logs: [
      {
        title: '운영보전금 승인',
        call: 'IncentiveDistributor.approveOpenSubsidy(VILLA-1, 2026-10)',
        result: '10월 운영보전금 승인 · 5면 × 20,000',
        kind: 'success',
      },
      {
        title: '운영보전금 지급',
        call: 'IncentiveDistributor.executeOpenSubsidy(VILLA-1, 2026-10)',
        result: '운영보전금 +100,000',
        kind: 'success',
        amount: DISTRICT.subsidy,
      },
    ],
    doneTitle: '받았어요',
    results: [{ tone: 'ok', text: '운영보전금 +100,000원' }],
    apply: (s) => ({ ...s, subsidyPaid: DISTRICT.subsidy }),
  },
  {
    id: 'c-3h',
    chapter: '조건 미충족 시',
    kind: 'reject',
    role: '조건 미충족 시',
    time: '2026.12.05 10:00 (가정)',
    short: '사전 약속 공유 면수 미충족 시, 운영 보전금 지급 보류',
    headline: '11월에 공유 면수가 5면에서 3면으로 줄면 최소 요건 미달로 그달 운영보전금은 보류됩니다.',
    actionLabel: '11월분 지급 시도',
    visual: { type: 'hold' },
    checks: [
      { label: '11월 최소 공유 3면', ok: false },
      { label: '최소 공유 요건 5면 이상', ok: false, code: 'BelowMinimumOpen' },
    ],
    logs: [
      {
        title: '11월 운영보전금 보류',
        call: 'IncentiveDistributor.executeOpenSubsidy(VILLA-1, 2026-11)',
        result: '최소 공유 요건(5면) 미달 · 3면 × 20,000 = 60,000 지급 없음 · 적격성 재검토',
        kind: 'reject',
        code: 'BelowMinimumOpen',
        amount: DISTRICT.heldSubsidy,
      },
    ],
    doneTitle: '보류됐어요',
    results: [{ tone: 'reject', text: '보류 · 최소 공유 요건(5면) 미달 · 60,000원 지급 없음', code: 'BelowMinimumOpen' }],
    sheetBalance: '예산 불변',
    apply: (s) => s,
  },
  {
    id: 'c-4',
    chapter: '추가 인센티브',
    kind: 'pass',
    role: '미유올',
    time: '2026.11.05',
    heading: '기존에 운영이 어려웠던, 추가 인센티브 연계',
    short: '이용률 80% 이상인 건물, 추가 인센티브 지급',
    headline: '같은 기준이라도 이용된 만큼 달라집니다. 빌라는 80%로 대상이 되고, 아파트는 60%라 0원입니다.',
    actionLabel: '이용 통계 제출',
    visual: { type: 'compare' },
    checks: [
      { label: '가상 빌라 1동 · 판매 4면 ÷ 공유 5면 = 80%', ok: true, code: 'IncentiveDistributor' },
      { label: '가상 아파트 1동 · 판매 6면 ÷ 공유 10면 = 60%', ok: false, code: 'NotEligible' },
    ],
    logs: [
      {
        title: '빌라 10월 이용 통계',
        call: 'IncentiveDistributor.submitUsageStats(VILLA-1, 2026-10, open 5, sold 4)',
        result: '이용률 80% · 기준 충족 → 구청 승인 대기',
        kind: 'success',
      },
      {
        title: '아파트 10월 이용 통계',
        call: 'IncentiveDistributor.submitUsageStats(APT-1, 2026-10, open 10, sold 6)',
        result: '이용률 60% · 기준(80%) 미달 → 지급 0원, 예산 불변',
        kind: 'reject',
        code: 'NotEligible',
      },
    ],
    results: [
      { tone: 'ok', text: '가상 빌라 1동 80% · 지역 인센티브 대상 (구청 승인 대기)' },
      { tone: 'reject', text: '가상 아파트 1동 60% · 기준(80%) 미달 · 0원', code: 'NotEligible' },
    ],
    doneTitle: '기준을 넘었어요',
    apply: (s) => ({ ...s, usageSubmitted: true }),
  },
  {
    id: 'c-5',
    noSheet: true,
    chapter: '구청 승인',
    kind: 'success',
    role: '구청 담당자 → 하나은행',
    time: '2026.11.06 14:20',
    short: '구청 승인 서명, 지역 인센티브 지급',
    headline: '구청 담당자가 승인하면 회차 예산 안에서 지역 인센티브(예: 인천e음 포인트)가 지급됩니다.',
    actionLabel: '승인 서명',
    visual: { type: 'incentive' },
    logs: [
      {
        title: '지역 인센티브 승인',
        call: 'IncentiveDistributor.approveUsageIncentive(VILLA-1, 2026-10)',
        result: '구청 담당자 승인 서명',
        kind: 'success',
      },
      {
        title: '지역 인센티브 지급',
        call: 'IncentiveDistributor.executeUsageIncentive(VILLA-1, 2026-10)',
        result: '지역 인센티브 +12,000 · 예산 차감',
        kind: 'success',
        amount: DISTRICT.incentive,
      },
    ],
    doneTitle: '받았어요',
    results: [{ tone: 'ok', text: '지역 인센티브 +12,000원' }],
    apply: (s) => ({ ...s, approved: true, executed: true, incentivePaid: DISTRICT.incentive }),
  },
]

function initialState(): DemoCState {
  return {
    records: [],
    deposited: 0,
    minted: 0,
    supportChosen: false,
    openDays: 0,
    subsidyPaid: 0,
    usageSubmitted: false,
    approved: false,
    executed: false,
    incentivePaid: 0,
    facilityPaid: 0,
  }
}

export const demoC: Demo<DemoCState, DemoCVisual> = {
  id: 'c',
  letter: 'C',
  chipLabel: '구청 지원',
  title: '시연 C · 공유를 유지하고 이용된 만큼 구청 지원금 지급',
  scenes: () => scenes,
  initialState,
}
