'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { checksFor, stateAt } from '@/lib/engine'
import type { Demo, Scene } from '@/lib/demos/types'

export type Phase = 'ready' | 'running' | 'done'
export type PlayMode = 'auto' | 'manual'

export const TIMING = {
  enter: 600,
  cursor: 500,
  press: 150,
  check: 400,
  autoClose: 1600,
  hold: 2800,
}

export function hasSheet(scene: Scene) {
  return scene.kind !== 'info' && !scene.noSheet
}

export function estimateSceneMs(scene: Scene) {
  const ready = TIMING.enter + TIMING.cursor + TIMING.press
  const sheet = hasSheet(scene) ? (checksFor(scene).length + 1) * TIMING.check + TIMING.autoClose : 0
  return ready + sheet + (scene.durationMs ?? TIMING.hold)
}

export function useDemoPlayer(demo: Demo | undefined, caseId: string, onComplete?: () => void) {
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })
  const scenes = useMemo(() => (demo ? demo.scenes(caseId) : []), [demo, caseId])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [mode, setMode] = useState<PlayMode>('manual')
  const [playing, setPlaying] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetStep, setSheetStep] = useState(0)
  const [pressing, setPressing] = useState(false)

  const scene = scenes[index] as Scene | undefined
  const checks = useMemo(() => (scene ? checksFor(scene) : []), [scene])
  const sheetResolved = sheetOpen && sheetStep > checks.length
  const isLast = index === scenes.length - 1

  const [resetKey, setResetKey] = useState(`${demo?.id}-${caseId}`)
  const currentKey = `${demo?.id}-${caseId}`
  if (resetKey !== currentKey) {
    setResetKey(currentKey)
    setIndex(0)
    setPhase('ready')
    setSheetOpen(false)
    setSheetStep(0)
    setPressing(false)
  }

  const prevState = useMemo(() => (demo ? stateAt(demo, caseId, index - 1) : null), [demo, caseId, index])
  const nextState = useMemo(() => (demo ? stateAt(demo, caseId, index) : null), [demo, caseId, index])
  const shownState = phase === 'done' ? nextState : prevState

  const startScene = useCallback(
    (i: number) => {
      const target = scenes[i]
      if (!target) return
      setIndex(i)
      setPressing(false)
      if (hasSheet(target)) {
        setSheetStep(0)
        setSheetOpen(true)
        setPhase('running')
      } else {
        setSheetOpen(false)
        setPhase('done')
      }
    },
    [scenes],
  )

  const seek = useCallback(
    (i: number) => {
      if (i < 0 || i >= scenes.length) return
      setIndex(i)
      setPhase('ready')
      setSheetOpen(false)
      setSheetStep(0)
      setPressing(false)
    },
    [scenes.length],
  )

  const next = useCallback(() => {
    if (index < scenes.length - 1) seek(index + 1)
  }, [index, scenes.length, seek])

  const prev = useCallback(() => {
    if (phase !== 'ready') seek(index)
    else if (index > 0) seek(index - 1)
  }, [index, phase, seek])

  const reset = useCallback(() => seek(0), [seek])

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
    setPhase('done')
  }, [])

  const run = useCallback(() => {
    if (phase === 'ready') startScene(index)
  }, [phase, index, startScene])

  const runVariant = useCallback(() => {
    if (!scene?.rejectVariant) return
    const target = scenes.findIndex((s) => s.id === scene.rejectVariant)
    if (target >= 0) startScene(target)
  }, [scene, scenes, startScene])

  const primary = useCallback(() => {
    if (phase === 'ready') run()
    else if (phase === 'done') {
      if (isLast) reset()
      else next()
    }
  }, [phase, run, isLast, reset, next])

  const play = useCallback(() => {
    setMode('auto')
    if (isLast && phase === 'done') seek(0)
    setPlaying(true)
  }, [isLast, phase, seek])

  const pause = useCallback(() => setPlaying(false), [])
  const togglePlay = useCallback(() => (playing ? pause() : play()), [playing, pause, play])

  const switchMode = useCallback((m: PlayMode) => {
    setMode(m)
    setPlaying(m === 'auto')
  }, [])

  // Condition-sheet check reveal (runs in both modes)
  useEffect(() => {
    if (!sheetOpen || sheetStep > checks.length) return
    const t = setTimeout(() => setSheetStep((s) => s + 1), TIMING.check)
    return () => clearTimeout(t)
  }, [sheetOpen, sheetStep, checks.length])

  // Auto-play timeline
  useEffect(() => {
    if (mode !== 'auto' || !playing || !scene) return
    const timers: ReturnType<typeof setTimeout>[] = []
    if (phase === 'ready') {
      const pressAt = TIMING.enter + TIMING.cursor
      timers.push(setTimeout(() => setPressing(true), pressAt))
      timers.push(setTimeout(() => startScene(index), pressAt + TIMING.press))
    } else if (phase === 'running' && sheetResolved) {
      timers.push(setTimeout(closeSheet, TIMING.autoClose))
    } else if (phase === 'done') {
      if (isLast) {
        if (onCompleteRef.current) {
          const finish = onCompleteRef.current
          timers.push(setTimeout(finish, scene.durationMs ?? TIMING.hold))
        } else setPlaying(false)
      } else timers.push(setTimeout(() => seek(index + 1), scene.durationMs ?? TIMING.hold))
    }
    return () => timers.forEach(clearTimeout)
  }, [mode, playing, phase, index, scene, sheetResolved, isLast, startScene, closeSheet, seek])

  return {
    scenes,
    scene,
    index,
    phase,
    mode,
    playing,
    pressing,
    sheetOpen,
    sheetStep,
    sheetResolved,
    checks,
    isLast,
    prevState,
    nextState,
    shownState,
    primary,
    runVariant,
    closeSheet,
    next,
    prev,
    seek,
    reset,
    play,
    pause,
    togglePlay,
    switchMode,
  }
}

export type DemoPlayer = ReturnType<typeof useDemoPlayer>
