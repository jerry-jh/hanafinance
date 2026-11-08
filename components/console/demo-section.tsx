'use client'

import { Hand, Play } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useDemoPlayer } from '@/hooks/useDemoPlayer'
import { DEMOS } from '@/lib/demos'
import { ConsoleCard } from './console-card'
import { Records } from './records'
import { SceneList } from './scene-list'

export function DemoSection() {
  const [letter, setLetter] = useState('A')
  const entry = DEMOS.find((d) => d.letter === letter) ?? DEMOS[0]
  const demo = entry.demo
  const [caseByDemo, setCaseByDemo] = useState<Record<string, string>>({})
  const caseId = demo ? (caseByDemo[demo.id] ?? demo.cases?.[0]?.id ?? 'default') : 'default'
  const playNextDemo = () => {
    const i = DEMOS.findIndex((d) => d.letter === letter)
    setLetter(DEMOS[(i + 1) % DEMOS.length].letter)
  }
  const player = useDemoPlayer(demo, caseId, playNextDemo)
  const sectionRef = useRef<HTMLElement>(null)

  const selectDemo = (l: string) => {
    if (l === letter) player.reset()
    setLetter(l)
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) return
    if (target?.closest('[role="dialog"][aria-labelledby="record-sheet-title"]')) return
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === ' ') {
      if (target?.tagName === 'BUTTON' || target?.tagName === 'A') return
      const rect = sectionRef.current?.getBoundingClientRect()
      if (!rect || rect.bottom < window.innerHeight / 2 || rect.top > window.innerHeight / 2) return
      e.preventDefault()
      player.togglePlay()
    } else if (e.key === 'ArrowRight') player.next()
    else if (e.key === 'ArrowLeft') player.prev()
    else if (e.key === 'r' || e.key === 'R') player.reset()
    else if (['1', '2', '3', '4'].includes(e.key)) selectDemo(DEMOS[Number(e.key) - 1].letter)
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const consoleRef = useRef<HTMLDivElement>(null)
  const startAutoplay = useEffectEvent(() => player.play())
  useEffect(() => {
    const el = consoleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAutoplay()
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="demo" aria-label="시연" className="px-5 pt-0 pb-28 sm:pb-32">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="시연 선택">
          {DEMOS.map((d) => {
            const selected = d.letter === letter
            return (
              <button
                key={d.letter}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectDemo(d.letter)}
                className={`rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors sm:text-[15px] ${
                  selected ? 'bg-ink font-bold text-white' : 'bg-soft text-sub hover:bg-line'
                }`}
              >
                <span className={selected ? 'mr-1.5 text-white/70' : 'mr-1.5 text-muted'}>{d.letter}</span>
                {d.heading}
              </button>
            )
          })}
        </div>
        <div ref={consoleRef} className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-10">
          <div className="flex flex-col">
            {demo ? (
              <>
                <div>
                  <SceneList player={player} />
                </div>
                <button
                  type="button"
                  onClick={() => player.switchMode(player.mode === 'auto' ? 'manual' : 'auto')}
                  className="mt-5 inline-flex items-center gap-1.5 self-start text-[15px] font-semibold text-ink-2 underline underline-offset-4 hover:text-ink"
                >
                  {player.mode === 'auto' ? (
                    <>
                      <Hand aria-hidden="true" className="size-4" />
                      직접 해보기
                    </>
                  ) : (
                    <>
                      <Play aria-hidden="true" className="size-4" fill="currentColor" />
                      자동 재생
                    </>
                  )}
                </button>
              </>
            ) : null}
          </div>

          <ConsoleCard
            demo={demo}
            caseId={caseId}
            onCaseChange={(id) => setCaseByDemo((m) => ({ ...m, [demo.id]: id }))}
            player={player}
          />
        </div>

        <div className="mt-16">
          <Records state={demo ? player.shownState : null} />
        </div>
      </div>
    </section>
  )
}
