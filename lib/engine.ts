import { config } from './config'
import type { BaseState, Demo, LedgerRecord, Scene, SceneCheck } from './demos/types'

export const engineMode = config.mode
export const chainId = config.chainId

function hashString(input: string) {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0
    h2 = Math.imul(h2 ^ c, 2246822519) >>> 0
  }
  return { h1, h2 }
}

export function mockHash(seed: string) {
  const { h1, h2 } = hashString(seed)
  const head = h1.toString(16).padStart(8, '0').slice(0, 4)
  const tail = h2.toString(16).padStart(8, '0').slice(-4)
  return `0x${head}…${tail}`
}

export function checksFor(scene: Scene): SceneCheck[] {
  if (scene.checks) return scene.checks
  let failed = false
  return scene.logs.map((log) => {
    if (failed) return { label: log.title, ok: null }
    const ok = log.kind !== 'reject'
    if (!ok) failed = true
    return { label: log.title, ok, code: log.code }
  })
}

function runScene<S extends BaseState>(state: S, scene: Scene<S>, demoId: string, caseId: string) {
  const next = scene.apply(state)
  const newRecords: LedgerRecord[] = scene.logs.map((log, i) => ({
    id: `${demoId}-${caseId}-${scene.id}-${i}`,
    sceneId: scene.id,
    time: scene.time,
    role: scene.role,
    headline: scene.headline,
    title: log.title,
    call: log.call,
    result: log.result,
    kind: log.kind,
    amount: log.amount,
    code: log.code,
    hash: mockHash(`${demoId}:${caseId}:${scene.id}:${i}:${log.call}`),
  }))
  return { ...next, records: [...newRecords.reverse(), ...next.records] }
}

/** State after scenes[0..index] have run. index = -1 returns the initial state. */
export function stateAt<S extends BaseState>(demo: Demo<S>, caseId: string, index: number): S {
  const scenes = demo.scenes(caseId)
  let state = demo.initialState(caseId)
  for (let i = 0; i <= index && i < scenes.length; i++) {
    state = runScene(state, scenes[i], demo.id, caseId)
  }
  return state
}
