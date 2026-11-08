export function SiteFooter() {
  return (
    <>
      <footer className="border-t border-line px-5 pt-14 pb-24">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[16px] font-bold text-ink">하나금융TI × 인하대학교 프로젝트</p>
        </div>
      </footer>
      {/* 화면 하단 고정 표기 (항상 유지) */}
      <div
        role="note"
        className="fixed inset-x-0 bottom-0 z-50 flex h-9 items-center justify-center truncate border-t border-line-soft bg-white/92 px-4 text-center text-[12.5px] text-muted-2 backdrop-blur"
      >
        GIWA Sepolia · TestKRW(실제 예금 아님) · 실제 증권 아님
      </div>
    </>
  )
}
