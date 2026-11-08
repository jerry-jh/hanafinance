import { FadeUp } from './fade-up'

export function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <FadeUp className="flex flex-col items-center text-center">
      {eyebrow ? <p className="mb-3 text-[16px] font-bold text-brand-text">{eyebrow}</p> : null}
      <h2 className="text-[36px] leading-tight font-extrabold tracking-[-0.03em] text-ink sm:text-[52px]">
        {title}
      </h2>
    </FadeUp>
  )
}
