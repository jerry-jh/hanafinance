import type { BaseState, Demo, Scene } from './types'

export type Vote = 'yes' | 'no' | null

export interface DemoAState extends BaseState {
  votes: Record<string, Vote>
  proposed: boolean
  passed: boolean
  settled: boolean
  vault: number
  cleaner: number
  deducted: number
}

export interface CalcStep {
  label: string
  value: number
  sign?: '−'
}

export type DemoAVisual =
  | { type: 'vote'; threshold: number }
  | { type: 'calc'; steps: CalcStep[]; split: { label: string; value: number }[] }
  | { type: 'bank'; label: string }
  | { type: 'vault'; label: string }
  | { type: 'payout'; label: string; payee: string; basis: string; chip: string }
  | { type: 'history'; rows: { label: string; sub: string; amount: number; sign: '+' | '−' }[]; balanceLabel: string }
  | { type: 'passCard'; badge: string; chip: string; sub: string }
  | { type: 'register'; label: string; chip: string; sub: string }
  | { type: 'perHousehold'; label: string; households: number }

export const UNITS = ['101', '102', '201', '202', '301', '302', '401', '402'] as const
export const VOTE_ORDER = ['101', '102', '201', '202', '301', '302', '401'] as const

const VOTE_PLAN: Record<string, Vote> = {
  '101': 'yes',
  '102': 'yes',
  '201': 'yes',
  '202': 'yes',
  '301': 'yes',
  '302': 'yes',
  '401': 'no',
  '402': null,
}

const VILLA = {
  payment: 160_000,
  pgFee: 4_800,
  net: 155_200,
  share: 93_120,
  miyuol: 62_080,
  cleaning: 80_000,
  balance: 13_120,
  quorum: 5,
}

const APT = {
  payment: 240_000,
  pgFee: 7_200,
  net: 232_800,
  share: 139_680,
  miyuol: 93_120,
  households: 30,
}

type S = Scene<DemoAState, DemoAVisual>

const villaScenes: S[] = [
  {
    id: 'a-v-1',
    chapter: '안건 등록',
    kind: 'info',
    role: 'S2 건물 대표',
    time: '2026.09.15 09:00',
    short: '건물 대표가 안건 등록',
    headline: '건물 대표가 공유 조건과 수익금 사용처를 한 안건으로 올립니다.',
    actionLabel: '안건 등록',
    visual: { type: 'vote', threshold: VILLA.quorum },
    logs: [
      {
        title: '안건 제1호 등록',
        call: 'BuildingGovernance.proposeTerms(VILLA-1, 5면·매일 24시간·월정액 40,000·청소비 지급 월 80,000)',
        result: '안건 제1호 등록 · 투표 기간 7일(09.15–09.21) · 투표권 구분소유자 8명',
        kind: 'success',
      },
    ],
    results: [{ tone: 'ok', text: '안건 제1호 등록 · 투표 기간 7일 · 투표권 8명' }],
    apply: (s) => ({ ...s, proposed: true }),
  },
  {
    id: 'a-v-2',
    chapter: '주민 투표',
    kind: 'success',
    role: 'S1 승인 주민',
    time: '2026.09.16',
    short: '거주민 투표 진행',
    headline: '승인된 주민이 찬성·반대를 누릅니다. 세대 수와 의결권을 함께 셉니다.',
    actionLabel: '투표 진행',
    durationMs: 4200,
    visual: { type: 'vote', threshold: VILLA.quorum },
    checks: [
      { label: '승인 주민 목록 확인', ok: true, code: 'BuildingGovernance' },
      { label: '투표 기간 안 (09.15–09.21)', ok: true },
    ],
    logs: [
      {
        title: '주민 투표 7건',
        call: 'BuildingGovernance.vote(1, …) × 7',
        result: '찬성 6 · 반대 1 · 미투표 1',
        kind: 'success',
      },
    ],
    doneTitle: '투표가 기록됐어요',
    results: [{ tone: 'ok', text: '찬성 6 · 반대 1 · 미투표 1' }],
    apply: (s) => ({ ...s, votes: { ...VOTE_PLAN } }),
  },
  {
    id: 'a-v-3',
    chapter: '중복 투표 거부',
    kind: 'reject',
    role: 'S1 주민 (예외)',
    time: '2026.09.16',
    short: '중복 투표 시도 시, 계약이 거부',
    headline: '승인 목록에 없는 계정과 이미 투표한 세대의 표는 계약이 거부합니다.',
    actionLabel: '거부 시도',
    visual: { type: 'vote', threshold: VILLA.quorum },
    checks: [
      { label: '승인 주민 목록 · 미등록 계정', ok: false, code: 'NotApprovedResident' },
      { label: '중복 투표 · 302호', ok: false, code: 'AlreadyVoted' },
    ],
    logs: [
      {
        title: '미승인 계정 투표 거부',
        call: 'BuildingGovernance.vote(1, …)',
        result: '이 건물의 승인 주민이 아님',
        kind: 'reject',
        code: 'NotApprovedResident',
      },
      {
        title: '302호 중복 투표 거부',
        call: 'BuildingGovernance.vote(1, …)',
        result: '이미 투표함 — 302호는 09.16 찬성으로 기록됨',
        kind: 'reject',
        code: 'AlreadyVoted',
      },
    ],
    doneTitle: '투표할 수 없어요',
    sheetBalance: '찬성 6 · 반대 1 (변동 없음)',
    results: [
      { tone: 'reject', text: '거부 · 이 건물의 승인 주민이 아님', code: 'NotApprovedResident' },
      { tone: 'reject', text: '거부 · 이미 투표함 — 302호는 09.16 찬성으로 기록됨', code: 'AlreadyVoted' },
    ],
    apply: (s) => s,
  },
  {
    id: 'a-v-4',
    chapter: '마감 · 가결',
    kind: 'pass',
    role: 'S2 건물 대표',
    time: '2026.09.22 10:00',
    short: '투표 마감 후 안건 가결',
    headline: '투표를 마감하자 가결됐습니다. 정한 조건이 그대로 지급 규칙이 됩니다.',
    actionLabel: '투표 마감',
    flash: true,
    visual: { type: 'vote', threshold: VILLA.quorum },
    checks: [
      { label: '구분소유자 과반 (6/8명 ≥ 5명)', ok: true },
      { label: '의결권 과반 (75.0% > 50%)', ok: true },
      { label: '투표 기간 종료 (09.21)', ok: true },
    ],
    logs: [
      {
        title: '투표 마감 · 가결',
        call: 'BuildingGovernance.close(1)',
        result: '가결 · 구분소유자 6/8명 · 의결권 75.0% → 미유올 등록 + 지급 조건 등록',
        kind: 'success',
      },
    ],
    doneTitle: '가결됐어요',
    sheetResults: [{ tone: 'ok', text: '가결 · 구분소유자 6/8명 · 의결권 75.0% → 미유올 등록 + 지급 조건 등록' }],
    results: [{ tone: 'ok', text: '가결 · 6/8명 · 75%', chip: '[청소비 지급]' }],
    apply: (s) => ({ ...s, passed: true }),
  },
  {
    id: 'a-v-5',
    chapter: '정산 확정',
    kind: 'info',
    role: 'S3 미유올 · 기존 정산시스템',
    time: '2026.11.05 09:00',
    short: '수수료 제외 후 건물 몫 계산(블록체인 밖에서)',
    headline: 'PG 수수료와 60:40 계산은 블록체인 밖 기존 정산시스템이 마칩니다.',
    actionLabel: '정산 확정',
    visual: {
      type: 'calc',
      steps: [
        { label: '결제', value: VILLA.payment },
        { label: 'PG 수수료 3%', value: VILLA.pgFee, sign: '−' },
        { label: '정산금', value: VILLA.net },
      ],
      split: [
        { label: '건물 몫 60%', value: VILLA.share },
        { label: '미유올 40%', value: VILLA.miyuol },
      ],
    },
    logs: [
      {
        title: '10월 정산 확정 (블록체인 밖)',
        call: '기존 정산시스템 · STL-2610-V01',
        result: '결제 160,000 → 정산금 155,200 → 건물 몫 93,120 / 미유올 62,080',
        kind: 'offchain',
        amount: VILLA.share,
      },
    ],
    results: [{ tone: 'info', text: '정산 확정 · 건물 몫 93,120원 · 정산 ID STL-2610-V01' }],
    apply: (s) => ({ ...s, settled: true }),
  },
  {
    id: 'a-v-6',
    chapter: '은행 전환',
    kind: 'success',
    role: 'S4 하나은행',
    time: '2026.11.05 09:00',
    short: '하나은행이 예금토큰으로 전환',
    headline: '건물 몫이 공용 계좌에 들어오자 하나은행이 예금토큰으로 전환합니다.',
    actionLabel: '전환 실행',
    visual: { type: 'bank', label: '하나은행 전환 · BankDesk' },
    logs: [
      {
        title: '모의 입금 기록',
        call: 'BankDesk.recordDeposit(STL-2610-V01, 93,120)',
        result: '공용 계좌 모의 입금 93,120',
        kind: 'success',
        amount: VILLA.share,
      },
      {
        title: '예금토큰 전환',
        call: 'BankDesk.convert(STL-2610-V01)',
        result: 'TestKRW 93,120 발행',
        kind: 'success',
        amount: VILLA.share,
      },
    ],
    doneTitle: '전환됐어요',
    results: [{ tone: 'ok', text: 'TestKRW 93,120원 발행' }],
    apply: (s) => ({ ...s, deposited: s.deposited + VILLA.share, minted: s.minted + VILLA.share }),
  },
  {
    id: 'a-v-7',
    chapter: '금고 입금',
    kind: 'success',
    role: 'S3 미유올',
    time: '2026.11.05 09:00',
    short: '빌라 공용 금고에 입금',
    headline: '정산 ID와 건물 몫을 빌라 금고 계약에 기록합니다.',
    actionLabel: '금고 기록',
    visual: { type: 'vault', label: '빌라 공용 금고 · SettlementVault' },
    logs: [
      {
        title: '빌라 금고 입금',
        call: 'SettlementVault.settleMonth(STL-2610-V01, VILLA-1, 2026-10, 160,000, 155,200)',
        result: '빌라 공용 금고 +93,120 · 미유올 몫 62,080은 기존 정산에서 지급',
        kind: 'success',
        amount: VILLA.share,
      },
    ],
    doneTitle: '기록됐어요',
    sheetBalance: '금고 잔액 93,120원',
    results: [{ tone: 'ok', text: '빌라 공용 금고 +93,120원' }],
    apply: (s) => ({ ...s, vault: s.vault + VILLA.share }),
  },
  {
    id: 'a-v-8',
    chapter: '청소비 지급',
    kind: 'success',
    role: '자동 · 지급 조건',
    time: '2026.11.05 09:00',
    short: '투표 결과대로 청소비 지급',
    headline: '투표로 정한 조건대로 청소 업체에 80,000원이 지급됩니다.',
    actionLabel: '80,000원 보내기',
    rejectVariant: 'a-v-9',
    visual: {
      type: 'payout',
      label: '빌라 공용 금고 · SettlementVault',
      payee: '청소 업체',
      basis: '근거 · 주민 투표 제1호',
      chip: '[청소비 지급]',
    },
    checks: [
      { label: '주민 투표 제1호 가결', ok: true, code: 'BuildingGovernance' },
      { label: '미유올 정산 확정', ok: true, code: 'SettlementVault' },
      { label: '하나은행 전환 기록', ok: true, code: 'BankDesk' },
      { label: '등록 청소 업체 · 월 상한 80,000원 이내', ok: true },
    ],
    logs: [
      {
        title: '청소비 지급',
        call: 'SettlementVault.applyRule(VILLA-1)',
        result: '청소 업체 +80,000 · 월 상한 80,000 · 금고 잔액 13,120',
        kind: 'success',
        amount: VILLA.cleaning,
      },
    ],
    doneTitle: '보냈어요',
    sheetBalance: '금고 잔액 13,120원',
    results: [{ tone: 'ok', text: '청소 업체에 80,000원을 보냈어요', chip: '[청소비 지급]' }],
    apply: (s) => ({ ...s, vault: s.vault - VILLA.cleaning, cleaner: s.cleaner + VILLA.cleaning }),
  },
  {
    id: 'a-v-9',
    chapter: '미등록 거부',
    kind: 'reject',
    role: '예외 시도',
    time: '2026.11.05 09:03',
    short: '투표로 정하지 않은 업체엔 지급 차단',
    headline: '주민이 정하지 않은 곳으로의 지급과 같은 정산 ID 재제출은 막힙니다.',
    actionLabel: '거부 시도',
    visual: { type: 'vault', label: '빌라 공용 금고 · SettlementVault' },
    checks: [
      { label: '주민 투표 제1호 가결', ok: true },
      { label: '받는 곳: 미등록 업체', ok: false, code: 'NotResolvedPayee' },
      { label: '월 상한 확인', ok: null },
    ],
    logs: [
      {
        title: '미등록 업체 지급 거부',
        call: 'SettlementVault.payout(VILLA-1, PARKING_REVENUE, 미등록 업체, 13,120)',
        result: '주민이 정한 사용처가 아님',
        kind: 'reject',
        code: 'NotResolvedPayee',
        amount: VILLA.balance,
      },
      {
        title: '같은 정산 ID 재제출 거부',
        call: 'SettlementVault.settleMonth(STL-2610-V01, …) 재제출',
        result: '같은 정산 ID는 한 번만 — 추가 발행 없음',
        kind: 'reject',
        code: 'DuplicateSettlement',
        amount: VILLA.share,
      },
    ],
    doneTitle: '보낼 수 없어요',
    sheetResults: [{ tone: 'reject', text: '거부 · 주민이 정한 사용처가 아니에요', code: 'NotResolvedPayee' }],
    sheetBalance: '금고 잔액 13,120원 (변동 없음)',
    sheetNote: '같은 정산 ID 재제출 ✕ DuplicateSettlement · 추가 발행 없음',
    results: [
      { tone: 'reject', text: '거부 · 주민이 정한 사용처가 아님', code: 'NotResolvedPayee' },
      { tone: 'reject', text: '거부 · 같은 정산 ID는 한 번만 — 추가 발행 없음', code: 'DuplicateSettlement' },
    ],
    apply: (s) => s,
  },
  {
    id: 'a-v-10',
    chapter: '주민 내역',
    kind: 'info',
    role: 'S1 주민',
    time: '2026.11.06',
    short: '거주민이 입출금 내역 확인 가능',
    headline: '주민은 들어온 돈과 나간 돈을 근거 안건과 함께 확인합니다.',
    actionLabel: '내역 보기',
    visual: {
      type: 'history',
      rows: [
        { label: '10월 공유 수익 입금', sub: '정산 ID STL-2610-V01', amount: VILLA.share, sign: '+' },
        { label: '청소비 지급', sub: '등록 청소 업체 · 주민 투표 제1호에 따름', amount: VILLA.cleaning, sign: '−' },
      ],
      balanceLabel: '잔액',
    },
    logs: [],
    apply: (s) => s,
  },
]

const aptScenes: S[] = [
  {
    id: 'a-a-1',
    chapter: '가결 확인',
    kind: 'pass',
    role: 'S2 관리단',
    time: '2026.09.22',
    short: '관리비 차감안 가결',
    headline: '가상 아파트 1동은 입주자등 과반(16세대 이상) 동의로 수익금을 관리비 차감에 쓰기로 했습니다.',
    actionLabel: '결과 확인',
    flash: true,
    visual: { type: 'passCard', badge: '가결', chip: '[관리비 차감]', sub: '입주자등 과반 동의 · 16세대 이상' },
    checks: [{ label: '입주자등 과반 동의 (16세대 이상)', ok: true }],
    logs: [
      {
        title: '관리비 차감 가결 확인',
        call: 'BuildingGovernance.close(APT-1)',
        result: '가결 · 입주자등 과반(16세대 이상) → 관리비 차감 조건 등록',
        kind: 'success',
      },
    ],
    doneTitle: '가결됐어요',
    results: [{ tone: 'ok', text: '가결 · 입주자등 과반 동의', chip: '[관리비 차감]' }],
    apply: (s) => ({ ...s, passed: true }),
  },
  {
    id: 'a-a-2',
    chapter: '정산 확정',
    kind: 'info',
    role: 'S3 미유올 · 기존 정산시스템',
    time: '2026.11.05 09:00',
    short: '수수료 제외 후 관리단 몫 계산(블록체인 밖에서)',
    headline: 'PG 수수료와 60:40 계산은 블록체인 밖 기존 정산시스템이 마칩니다.',
    actionLabel: '정산 확정',
    visual: {
      type: 'calc',
      steps: [
        { label: '결제', value: APT.payment },
        { label: 'PG 수수료 3%', value: APT.pgFee, sign: '−' },
        { label: '정산금', value: APT.net },
      ],
      split: [
        { label: '관리단 몫 60%', value: APT.share },
        { label: '미유올 40%', value: APT.miyuol },
      ],
    },
    logs: [
      {
        title: '10월 정산 확정 (블록체인 밖)',
        call: '기존 정산시스템 · STL-2610-A01',
        result: '결제 240,000 → 정산금 232,800 → 관리단 몫 139,680 / 미유올 93,120',
        kind: 'offchain',
        amount: APT.share,
      },
    ],
    results: [{ tone: 'info', text: '정산 확정 · 관리단 몫 139,680원 · 정산 ID STL-2610-A01' }],
    apply: (s) => ({ ...s, settled: true }),
  },
  {
    id: 'a-a-3',
    chapter: '은행 전환',
    kind: 'success',
    role: 'S4 하나은행',
    time: '2026.11.05 09:00',
    short: '하나은행이 예금토큰으로 전환',
    headline: '관리단 몫이 들어오자 하나은행이 예금토큰으로 전환합니다.',
    actionLabel: '전환 실행',
    visual: { type: 'bank', label: '하나은행 전환 · BankDesk' },
    logs: [
      {
        title: '모의 입금 기록',
        call: 'BankDesk.recordDeposit(STL-2610-A01, 139,680)',
        result: '관리단 계좌 모의 입금 139,680',
        kind: 'success',
        amount: APT.share,
      },
      {
        title: '예금토큰 전환',
        call: 'BankDesk.convert(STL-2610-A01)',
        result: 'TestKRW 139,680 발행',
        kind: 'success',
        amount: APT.share,
      },
    ],
    doneTitle: '전환됐어요',
    results: [{ tone: 'ok', text: 'TestKRW 139,680원 발행' }],
    apply: (s) => ({ ...s, deposited: s.deposited + APT.share, minted: s.minted + APT.share }),
  },
  {
    id: 'a-a-4',
    chapter: '관리단 입금',
    kind: 'success',
    role: 'S3 미유올',
    time: '2026.11.05 09:00',
    short: '관리단 지갑에 입금',
    headline: '정산 ID와 관리단 몫을 아파트 1동 관리단 지갑에 기록합니다.',
    actionLabel: '지갑 기록',
    visual: { type: 'vault', label: '아파트 1동 관리단 지갑 · SettlementVault' },
    logs: [
      {
        title: '관리단 지갑 입금',
        call: 'SettlementVault.settleMonth(STL-2610-A01, APT-1, 2026-10, 240,000, 232,800)',
        result: '아파트 1동 관리단 지갑 +139,680',
        kind: 'success',
        amount: APT.share,
      },
    ],
    doneTitle: '기록됐어요',
    sheetBalance: '관리단 지갑 139,680원',
    results: [{ tone: 'ok', text: '아파트 1동 관리단 지갑 +139,680원' }],
    apply: (s) => ({ ...s, vault: s.vault + APT.share }),
  },
  {
    id: 'a-a-5',
    chapter: '관리비 차감',
    kind: 'success',
    role: '자동 · 지급 조건',
    time: '2026.11.05 09:00',
    short: '다음 달 관리비 차감액 등록',
    headline: '투표로 정한 대로 139,680원이 다음 달 관리비 차감 재원으로 등록됩니다.',
    actionLabel: '지급 조건 실행',
    visual: {
      type: 'register',
      label: '아파트 1동 관리단 지갑 · SettlementVault',
      chip: '[관리비 차감]',
      sub: '다음 달 관리비 차감 재원',
    },
    logs: [
      {
        title: '관리비 차감 재원 등록',
        call: 'SettlementVault.applyRule(APT-1)',
        result: '139,680 → 다음 달 관리비 차감 재원 등록',
        kind: 'success',
        amount: APT.share,
      },
    ],
    doneTitle: '등록됐어요',
    results: [{ tone: 'ok', text: '139,680원 관리비 차감 재원 등록', chip: '[관리비 차감]' }],
    apply: (s) => ({ ...s, deducted: s.deducted + APT.share }),
  },
  {
    id: 'a-a-6',
    chapter: '우리 집 관리비',
    kind: 'info',
    role: 'S1 주민',
    time: '2026.11.06',
    short: '거주민이 관리비 절감 확인 가능',
    headline: '주민은 이번 달 관리비에서 차감된 금액을 확인합니다.',
    actionLabel: '내역 보기',
    visual: { type: 'perHousehold', label: '이번 달 우리 집 관리비', households: APT.households },
    logs: [],
    apply: (s) => s,
  },
]

function initialState(): DemoAState {
  return {
    records: [],
    deposited: 0,
    minted: 0,
    votes: Object.fromEntries(UNITS.map((u) => [u, null])),
    proposed: false,
    passed: false,
    settled: false,
    vault: 0,
    cleaner: 0,
    deducted: 0,
  }
}

export const demoA: Demo<DemoAState, DemoAVisual> = {
  id: 'a',
  letter: 'A',
  chipLabel: '주민 합의',
  title: '시연 A · 주민 투표로 정한 대로 공유 수익 집행',
  cases: [
    { id: 'villa', label: '빌라 · 청소비' },
    { id: 'apt', label: '아파트 · 관리비' },
  ],
  scenes: (caseId = 'villa') => (caseId === 'apt' ? aptScenes : villaScenes),
  initialState,
  detailNote: '테스트넷 투표는 관리단 결의를 대신하지 않아요.',
}
