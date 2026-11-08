'use client'

import type { Phase } from '@/hooks/useDemoPlayer'
import type { DemoAState, DemoAVisual } from '@/lib/demos/demo-a'
import type { DemoBState, DemoBVisual } from '@/lib/demos/demo-b'
import type { DemoCState, DemoCVisual } from '@/lib/demos/demo-c'
import type { DemoDState, DemoDVisual } from '@/lib/demos/demo-d'
import type { BaseState, Demo, Scene } from '@/lib/demos/types'
import { DemoAVisualView } from './visuals/demo-a-visual'
import { DemoBVisualView } from './visuals/demo-b-visual'
import { DemoCVisualView } from './visuals/demo-c-visual'
import { DemoDVisualView } from './visuals/demo-d-visual'

interface Props {
  demo: Demo
  scene: Scene
  prev: BaseState
  next: BaseState
  phase: Phase
}

export function SceneVisual({ demo, scene, prev, next, phase }: Props) {
  switch (demo.id) {
    case 'a':
      return (
        <DemoAVisualView
          visual={scene.visual as DemoAVisual}
          prev={prev as DemoAState}
          next={next as DemoAState}
          phase={phase}
        />
      )
    case 'b':
      return (
        <DemoBVisualView
          visual={scene.visual as DemoBVisual}
          prev={prev as DemoBState}
          next={next as DemoBState}
          phase={phase}
        />
      )
    case 'c':
      return (
        <DemoCVisualView
          visual={scene.visual as DemoCVisual}
          prev={prev as DemoCState}
          next={next as DemoCState}
          phase={phase}
        />
      )
    case 'd':
      return (
        <DemoDVisualView
          visual={scene.visual as DemoDVisual}
          prev={prev as DemoDState}
          next={next as DemoDState}
          phase={phase}
        />
      )
    default:
      return null
  }
}
