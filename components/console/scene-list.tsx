'use client'

import { Check, X } from 'lucide-react'
import { estimateSceneMs, type DemoPlayer } from '@/hooks/useDemoPlayer'

export function SceneList({ player }: { player: DemoPlayer }) {
  const { scenes, index, phase, mode, playing } = player
  return (
    <ol className="flex flex-col" aria-label="장면 목록">
      {scenes.map((s, i) => {
        const active = i === index
        const past = i < index || (active && phase === 'done')
        const reject = s.kind === 'reject'
        // 큰 제목이 바뀌는 단계(시나리오 갈래)는 위에 구분선과 갈래 제목을 보여줌
        const branch = i > 0 && s.heading ? s.heading.replace(/[[\]]/g, '') : null
        return (
          <li key={s.id} className={`border-b border-line-soft ${branch ? 'mt-6 border-t-2 border-t-ink-2 pt-2' : ''}`}>
            {branch && <p className="pb-1 text-[12px] leading-snug font-semibold text-muted">{branch}</p>}
            <button
              type="button"
              onClick={() => player.seek(i)}
              aria-current={active ? 'step' : undefined}
              className="group w-full py-3.5 text-left"
            >
              <span className="flex items-center justify-between gap-3">
                <span
                  className={`text-[16px] ${
                    active ? 'font-bold text-ink' : past ? 'text-muted' : 'text-muted-2'
                  } group-hover:text-ink-2`}
                >
                  {s.chapter}
                </span>
                {active ? (
                  <span className="text-[13px] font-semibold text-brand-text">
                    {phase === 'done' ? '완료' : '진행 중'}
                  </span>
                ) : past ? (
                  reject ? (
                    <X aria-label="거부" className="size-4 text-danger" strokeWidth={2.5} />
                  ) : (
                    <Check aria-label="완료" className="size-4 text-muted" strokeWidth={2.5} />
                  )
                ) : null}
              </span>
            </button>
            {active && (
              <div aria-hidden="true" className="h-0.5 w-full bg-line-soft">
                <div
                  key={`${s.id}-${mode}`}
                  className="h-full bg-ink"
                  style={
                    mode === 'auto'
                      ? {
                          animation: `progress-fill ${estimateSceneMs(s)}ms linear forwards`,
                          animationPlayState: playing ? 'running' : 'paused',
                        }
                      : { width: phase === 'done' ? '100%' : phase === 'running' ? '50%' : '8%', transition: 'width 300ms' }
                  }
                />
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
