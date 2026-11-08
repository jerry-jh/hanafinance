'use client'

import { motion } from 'framer-motion'
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
  // 큰 제목: 현재 단계까지 중 가장 최근에 heading을 지정한 단계의 문구, 없으면 시나리오 기본 제목
  const heading =
    player.scenes
      .slice(0, player.index + 1)
      .reverse()
      .find((s) => s.heading)?.heading ?? entry.heading

  const selectDemo = (l: string) => {
    if (l === letter) player.reset()
    setLetter(l)
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) return
    if (target?.closest('[role="dialog"][aria-labelledby="record-sheet-title"]')) return
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'ArrowRight') player.next()
    else if (e.key === 'ArrowLeft') player.prev()
    else if (e.key === 'r' || e.key === 'R') player.reset()
    else if (['1', '2', '3', '4'].includes(e.key)) selectDemo(DEMOS[Number(e.key) - 1].letter)
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <section ref={sectionRef} id="demo" aria-label="시연" className="px-5 pt-0 pb-28 sm:pb-32">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-5 flex flex-wrap justify-center gap-2" role="tablist" aria-label="시연 선택">
          {DEMOS.map((d, i) => {
            const selected = d.letter === letter
            return (
              <button
                key={d.letter}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectDemo(d.letter)}
                className={`rounded-full px-4 py-2 text-[14px] font-semibold transition-colors sm:text-[15px] ${
                  selected ? 'bg-ink font-bold text-white' : 'bg-soft text-sub hover:bg-line'
                }`}
              >
                <span className={selected ? 'mr-1.5 text-white/70' : 'mr-1.5 text-muted'}>{i + 1}</span>
                {d.heading.replace(/[[\]]/g, '')}
              </button>
            )
          })}
        </div>
        <motion.h2
          key={`${entry.letter}-${heading}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-7 text-center text-[26px] leading-tight font-extrabold tracking-tight text-balance text-ink sm:text-[32px] lg:text-[36px]"
        >
          {heading.split(/(\[[^\]]+\])/).map((part, i) =>
            part.startsWith('[') ? (
              <span key={i} className="text-point">
                {part.slice(1, -1)}
              </span>
            ) : (
              part
            ),
          )}
        </motion.h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
          <div className="flex flex-col">
            {demo ? (
              <>
                <div>
                  <SceneList player={player} />
                </div>
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
