import { formatLongDate, isToday, relativeLabel } from '../lib/dates'

export function DateHeader({
  date,
  doneCount,
  totalCount,
  onPrev,
  onNext,
  onOpenCalendar,
  onOpenWeek
}: {
  date: string
  doneCount: number
  totalCount: number
  onPrev: () => void
  onNext: () => void
  onOpenCalendar: () => void
  onOpenWeek: () => void
}) {
  const { weekday, day, month, year } = formatLongDate(date)
  const rel = relativeLabel(date)
  const today = isToday(date)
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="px-[26px] pt-[10px] pb-4 border-b border-paper-divider">
      <div className="flex justify-between items-end gap-3">
        <button onClick={onOpenCalendar} className="text-left min-w-0 active:opacity-70 transition">
          {rel && (
            <div className={`text-[0.6875rem] font-bold tracking-[.14em] ${today ? 'text-azul' : 'text-ink-faint'}`}>
              {rel}
            </div>
          )}
          <div className="font-serif text-[2.5rem] leading-[1.05] text-ink truncate">
            {weekday} {day}
          </div>
          <div className="text-[0.8125rem] text-ink-faint mt-0.5">
            {month} {year}
          </div>
        </button>

        <div className="flex gap-2 items-center shrink-0">
          <button
            aria-label="Día anterior"
            onClick={onPrev}
            className="w-9 h-9 rounded-full border border-paper-line flex items-center justify-center text-ink active:scale-95 transition"
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Día siguiente"
            onClick={onNext}
            className="w-9 h-9 rounded-full border border-paper-line flex items-center justify-center text-ink active:scale-95 transition"
          >
            <ChevronRight />
          </button>
          <button
            aria-label="Vista semanal"
            onClick={onOpenWeek}
            className="w-9 h-9 rounded-full bg-ink text-ink-onDark flex items-center justify-center text-[0.875rem] active:scale-95 transition"
          >
            ▤
          </button>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="flex items-center gap-[10px] mt-[14px]">
          <div className="flex-1 h-[5px] bg-paper-track rounded-full overflow-hidden">
            <div className="h-full bg-azul rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[0.75rem] font-semibold text-ink-soft shrink-0">
            {doneCount} de {totalCount}
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
