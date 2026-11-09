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
  | { type: 'vote'; threshold: number; attempts?: boolean; agenda?: { items: { label: string; ask: string; decided: string }[] } }
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
    id: 'a-v-2',
    noSheet: true,
    chapter: '주민 투표',
    kind: 'success',
    role: '주민',
    time: '2026.09.16',
    short: '주민 투표 진행',
    headline: '승인된 주민이 찬성·반대를 누릅니다. 세대 수와 의결권을 함께 셉니다.',
    actionLabel: '투표 진행',
    durationMs: 4200,
    revealDelayMs: 2900,
    flash: true,
    visual: {
      type: 'vote',
      threshold: VILLA.quorum,
      agenda: {
        items: [
          { label: '안건1', ask: '공유 면수, 공유 시간, 금액', decided: '4면 공유, 9~18시, 월 4만 원' },
          { label: '안건2', ask: '공유 주차 수익금 사용처', decided: '공유 주차 수익금은 청소비로 지급' },
        ],
      },
    },
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
      {
        title: '투표 마감 · 가결',
        call: 'BuildingGovernance.close(1)',
        result: '가결 · 구분소유자 6/8명 · 의결권 75.0% → 미유올 등록 + 지급 조건 등록',
        kind: 'success',
      },
    ],
    doneTitle: '가결됐어요',
    results: [
      { tone: 'ok', text: '찬성 6/8명 · 가결' },
    ],
    apply: (s) => ({ ...s, votes: { ...VOTE_PLAN }, passed: true }),
  },
  {
    id: 'a-v-5',
    chapter: '정산 확정',
    kind: 'info',
    role: '미유올',
    time: '2026.11.05 09:00',
    short: '공유주차 결제 및 사용 완료',
    headline: 'PG 수수료와 60:40 계산은 오프체인 기존 정산시스템이 마칩니다.',
    actionLabel: '정산 확정',
    flash: true,
    stamp: '정산 완료',
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
        title: '10월 정산 확정 (오프체인)',
        call: '기존 정산시스템 · STL-2610-V01',
        result: '결제 160,000 → 정산금 155,200 → 건물 몫 93,120 / 미유올 62,080',
        kind: 'offchain',
        amount: VILLA.share,
      },
    ],
    apply: (s) => ({ ...s, settled: true }),
  },
  {
    id: 'a-v-6',
    noSheet: true,
    chapter: '토큰 전환',
    kind: 'success',
    role: '은행',
    time: '2026.11.05 09:00',
    kicker: '관리단 계좌로 입금된 수익금은',
    short: '모의 예금토큰으로 전환',
    headline: '건물 몫이 공용 계좌에 들어오자 은행이 모의 예금토큰으로 전환합니다.',
    actionLabel: '전환 실행',
    visual: { type: 'bank', label: '' },
    logs: [
      {
        title: '모의 입금 기록',
        call: 'BankDesk.recordDeposit(STL-2610-V01, 93,120)',
        result: '공용 계좌 모의 입금 93,120',
        kind: 'success',
        amount: VILLA.share,
      },
      {
        title: '모의 예금토큰 전환',
        call: 'BankDesk.convert(STL-2610-V01)',
        result: 'TestKRW 93,120 발행',
        kind: 'success',
        amount: VILLA.share,
      },
    ],
    doneTitle: '전환됐어요',
    results: [{ tone: 'ok', text: '93,120 TestKRW 발행' }],
    apply: (s) => ({ ...s, deposited: s.deposited + VILLA.share, minted: s.minted + VILLA.share }),
  },
  {
    id: 'a-v-7',
    noSheet: true,
    chapter: '지갑에 전송',
    kind: 'success',
    role: '미유올',
    time: '2026.11.05 09:00',
    short: '건물 공용 지갑에 전송',
    headline: '정산 ID와 건물 몫을 빌라 금고 계약에 기록합니다.',
    actionLabel: '지갑에 전송',
    visual: { type: 'vault', label: '건물 공용 지갑' },
    logs: [
      {
        title: '빌라 금고 입금',
        call: 'SettlementVault.settleMonth(STL-2610-V01, VILLA-1, 2026-10, 160,000, 155,200)',
        result: '건물 공용 지갑 +93,120 · 미유올 몫 62,080은 기존 정산에서 지급',
        kind: 'success',
        amount: VILLA.share,
      },
    ],
    doneTitle: '기록됐어요',
    sheetBalance: '금고 잔액 93,120원',
    results: [{ tone: 'ok', text: '건물 공용 지갑 +93,120 TestKRW' }],
    apply: (s) => ({ ...s, vault: s.vault + VILLA.share }),
  },
  {
    id: 'a-v-8',
    noSheet: true,
    chapter: '청소비 지급',
    kind: 'success',
    role: '자동 · 지급 조건',
    time: '2026.11.05 09:00',
    kicker: '청소비 입금일에',
    short: '앞선 투표 결과대로 청소비 자동 지급',
    headline: '투표로 정한 조건대로 청소 업체에 80,000원이 지급됩니다.',
    actionLabel: '80,000원 보내기',
    rejectVariant: 'a-v-9',
    visual: {
      type: 'payout',
      label: '건물 공용 지갑',
      payee: '청소 업체',
      basis: '근거 · 주민 투표 제1호',
      chip: '청소비 지급',
    },
    checks: [
      { label: '주민 투표 제1호 가결', ok: true, code: 'BuildingGovernance' },
      { label: '미유올 정산 확정', ok: true, code: 'SettlementVault' },
      { label: '은행 전환 기록', ok: true, code: 'BankDesk' },
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
    results: [{ tone: 'ok', text: '청소 업체에 80,000원을 보냈어요', chip: '청소비 지급' }],
    apply: (s) => ({ ...s, vault: s.vault - VILLA.cleaning, cleaner: s.cleaner + VILLA.cleaning }),
  },
]

const aptScenes: S[] = [
  {
    id: 'a-a-1',
    chapter: '가결 확인',
    kind: 'pass',
    role: '관리단',
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
    role: '미유올',
    time: '2026.11.05 09:00',
    short: '수수료 제외 후 관리단 몫 계산(오프체인에서)',
    headline: 'PG 수수료와 60:40 계산은 오프체인 기존 정산시스템이 마칩니다.',
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
        title: '10월 정산 확정 (오프체인)',
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
    chapter: '토큰 전환',
    kind: 'success',
    role: '은행',
    time: '2026.11.05 09:00',
    short: '모의 예금토큰으로 전환',
    headline: '관리단 몫이 들어오자 은행이 모의 예금토큰으로 전환합니다.',
    actionLabel: '전환 실행',
    visual: { type: 'bank', label: '' },
    logs: [
      {
        title: '모의 입금 기록',
        call: 'BankDesk.recordDeposit(STL-2610-A01, 139,680)',
        result: '관리단 계좌 모의 입금 139,680',
        kind: 'success',
        amount: APT.share,
      },
      {
        title: '모의 예금토큰 전환',
        call: 'BankDesk.convert(STL-2610-A01)',
        result: 'TestKRW 139,680 발행',
        kind: 'success',
        amount: APT.share,
      },
    ],
    doneTitle: '전환됐어요',
    results: [{ tone: 'ok', text: '139,680 TestKRW 발행' }],
    apply: (s) => ({ ...s, deposited: s.deposited + APT.share, minted: s.minted + APT.share }),
  },
  {
    id: 'a-a-4',
    chapter: '관리단 입금',
    kind: 'success',
    role: '미유올',
    time: '2026.11.05 09:00',
    short: '관리단 지갑에 입금',
    headline: '정산 ID와 관리단 몫을 아파트 1동 관리단 지갑에 기록합니다.',
    actionLabel: '지갑 기록',
    visual: { type: 'vault', label: '아파트 1동 관리단 지갑' },
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
      label: '아파트 1동 관리단 지갑',
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
    role: '주민',
    time: '2026.11.06',
    short: '주민이 관리비 절감 확인 가능',
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
  title: '시연 A · 주민 투표로 정한 조건에 따른 공유 주차 수익 자동 지급',
  // 아파트 사례(aptScenes)는 화면에서 뺐어요. 다시 쓰려면 cases를 되살리면 돼요.
  scenes: () => villaScenes,
  initialState,
  detailNote: '테스트넷 투표는 관리단 결의를 대신하지 않아요.',
}
