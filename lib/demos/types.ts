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
