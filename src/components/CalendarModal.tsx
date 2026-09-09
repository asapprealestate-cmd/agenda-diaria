import { useState } from 'react'
import {
  addDays,
  buildMonthGrid,
  fromISO,
  monthLabel,
  nextWeekdayLabel,
  todayISO,
  weekDays,
  weekdayShort
} from '../lib/dates'

export function CalendarModal({
  selected,
  onSelect,
  onClose
}: {
  selected: string
  onSelect: (iso: string) => void
  onClose: () => void
}) {
  const sel = fromISO(selected)
  const [cursor, setCursor] = useState({ year: sel.getFullYear(), month: sel.getMonth() })
  const today = todayISO()
  const grid = buildMonthGrid(cursor.year, cursor.month)
  const strip = weekDays(selected)
  const tomorrow = addDays(today, 1)
  const next = nextWeekdayLabel()

  function shiftMonth(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  function pick(iso: string) {
    onSelect(iso)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] sm:mb-8 sm:rounded-[24px] bg-paper rounded-t-[26px] shadow-sheet sheet-in max-h-[88vh] overflow-y-auto">
        <div className="px-[26px] pt-4 pb-3 flex items-center justify-between">
          <span className="font-serif text-[24px] text-ink">Ir a</span>
          <button onClick={onClose} className="text-[15px] font-semibold text-ink-faint">
            Cerrar
          </button>
        </div>

        <div className="pb-[18px] pl-[26px]">
          <div className="text-[11px] font-bold tracking-[.14em] text-ink-faint mb-3 uppercase">
            {monthLabel(fromISO(selected).getFullYear(), fromISO(selected).getMonth())}
          </div>
          <div className="flex gap-2 overflow-x-auto pr-[26px]">
            {strip.map((iso) => {
              const isSel = iso === selected
              const d = fromISO(iso)
              return (
                <button
                  key={iso}
                  onClick={() => pick(iso)}
                  className={[
                    'w-[52px] shrink-0 rounded-lg py-[9px] text-center border',
                    isSel ? 'bg-ink border-ink' : 'bg-paper-alt border-paper-line'
                  ].join(' ')}
                >
                  <div className={`text-[10px] font-bold ${isSel ? 'text-ink-onDarkFaint' : 'text-ink-faintest'}`}>
                    {weekdayShort(iso)}
                  </div>
                  <div className={`font-serif text-[22px] ${isSel ? 'text-ink-onDark' : 'text-ink-faint'}`}>
                    {d.getDate()}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-[26px] pt-[18px] border-t border-paper-divider">
          <div className="flex items-center justify-between mb-4">
            <span className="font-serif text-[22px] text-ink">{monthLabel(cursor.year, cursor.month)}</span>
            <div className="flex gap-2">
              <button
                onClick={() => shiftMonth(-1)}
                className="w-8 h-8 rounded-full border border-paper-line flex items-center justify-center text-[14px] text-ink"
                aria-label="Mes anterior"
              >
                ‹
              </button>
              <button
                onClick={() => shiftMonth(1)}
                className="w-8 h-8 rounded-full border border-paper-line flex items-center justify-center text-[14px] text-ink"
                aria-label="Mes siguiente"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-ink-faintest mb-1.5">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 font-serif text-[17px] text-ink text-center pb-2">
            {grid.map(({ iso, inMonth }, i) => {
              const isSelected = iso === selected
              const isWeekend = i % 7 === 5 || i % 7 === 6
              const dayNum = fromISO(iso).getDate()
              return (
                <button
                  key={iso}
                  onClick={() => pick(iso)}
                  className={[
                    'py-[9px] rounded-md',
                    isSelected ? 'bg-ink text-ink-onDark' : '',
                    !isSelected && !inMonth ? 'text-paper-line' : '',
                    !isSelected && inMonth && isWeekend ? 'text-ink-faintest' : '',
                    !isSelected && inMonth && !isWeekend ? 'text-ink' : ''
                  ].join(' ')}
                >
                  {dayNum}
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 mt-4 pb-6">
            <button
              onClick={() => pick(today)}
              className="flex-1 text-center text-[13px] font-semibold text-azul border border-azul-tintBorder rounded-full py-[9px]"
            >
              Hoy
            </button>
            <button
              onClick={() => pick(tomorrow)}
              className="flex-1 text-center text-[13px] font-semibold text-ink-soft border border-paper-line rounded-full py-[9px]"
            >
              Mañana
            </button>
            <button
              onClick={() => pick(next.iso)}
              className="flex-1 text-center text-[13px] font-semibold text-ink-soft border border-paper-line rounded-full py-[9px] capitalize"
            >
              {next.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
