export type SceneKind = 'info' | 'success' | 'pass' | 'reject' | 'unlock'
export type LogKind = 'success' | 'reject' | 'offchain'

export interface SceneLog {
  title: string
  call: string
  result: string
  kind: LogKind
  amount?: number
  code?: string
}

export interface SceneCheck {
  label: string
  ok: boolean | null
  code?: string
}

export interface SceneResult {
  tone: 'ok' | 'reject' | 'info'
  text: string
  code?: string
  chip?: string
}

export interface LedgerRecord {
  id: string
  sceneId: string
  time: string
  role: string
  headline: string
  title: string
  call: string
  result: string
  kind: LogKind
  amount?: number
  code?: string
  hash: string
}

export interface BaseState {
  records: LedgerRecord[]
  deposited: number
  minted: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Scene<S extends BaseState = any, V = unknown> {
  id: string
  chapter: string
  kind: SceneKind
  role: string
  time: string
  short: string
  headline: string
  actionLabel: string
  checks?: SceneCheck[]
  logs: SceneLog[]
  apply: (state: S) => S
  durationMs?: number
  results?: SceneResult[]
  sheetResults?: SceneResult[]
  doneTitle?: string
  sheetBalance?: string
  sheetNote?: string
  rejectVariant?: string
  flash?: boolean
  // true면 버튼을 눌러도 아래에서 올라오는 확인 시트 없이 바로 결과로 넘어가요
  noSheet?: boolean
  // 결과 줄·반짝임을 이만큼(ms) 늦게 보여줘요 (애니메이션이 끝난 뒤 나오게)
  revealDelayMs?: number
  // 완료 순간 카드 가운데에 잠깐 떴다 사라지는 도장 문구
  stamp?: string
  // 이 단계부터 시나리오 큰 제목을 이 문구로 바꿔요 (뒤 단계에도 이어짐)
  heading?: string
  visual: V
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Demo<S extends BaseState = any, V = unknown> {
  id: string
  letter: string
  chipLabel: string
  title: string
  cases?: { id: string; label: string }[]
  scenes: (caseId?: string) => Scene<S, V>[]
  initialState: (caseId?: string) => S
  detailNote?: string
}
