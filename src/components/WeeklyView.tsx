import { useAuth } from '../hooks/useAuth'
import { useWeekTasks } from '../hooks/useWeekTasks'
import { addDays, diffDays, fromISO, isoWeekNumber, monthShort, todayISO, weekDays, weekdayShort } from '../lib/dates'
import type { Task } from '../lib/types'

export function WeeklyView({
  weekStart,
  onSelectDay,
  onBack
}: {
  weekStart: string
  onSelectDay: (iso: string) => void
  onBack: () => void
}) {
  const { user } = useAuth()
  const { byDate, loading } = useWeekTasks(weekStart, user?.id)
  const days = weekDays(weekStart)
  const weekEnd = addDays(weekStart, 6)
  const today = todayISO()

  return (
    <div className="min-h-screen flex flex-col bg-paper font-sans">
      <div className="px-[26px] pt-[10px] pb-[14px] flex justify-between items-end border-b border-paper-divider">
        <div>
          <div className="text-[11px] font-bold tracking-[.14em] text-ink-faint">
            SEMANA {isoWeekNumber(weekStart)}
          </div>
          <div className="font-serif text-[32px] leading-[1.1] text-ink">
            {fromISO(weekStart).getDate()} → {fromISO(weekEnd).getDate()} {monthShort(weekEnd)}
          </div>
        </div>
        <button onClick={onBack} className="text-[13px] font-semibold text-azul pb-1">
          Ver día
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[26px]">
        {loading ? (
          <p className="text-center text-ink-faintest text-sm mt-10">Cargando…</p>
        ) : (
          days.map((iso) => (
            <DayRow key={iso} iso={iso} tasks={byDate[iso] ?? []} isToday={iso === today} onSelect={() => onSelectDay(iso)} />
          ))
        )}
      </div>
    </div>
  )
}

function DayRow({
  iso,
  tasks,
  isToday,
  onSelect
}: {
  iso: string
  tasks: Task[]
  isToday: boolean
  onSelect: () => void
}) {
  const sorted = [...tasks].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
  const visible = sorted.slice(0, 4)
  const overflow = sorted.length - visible.length
  const today = todayISO()

  return (
    <button
      onClick={onSelect}
      className={[
        'w-full text-left flex gap-[14px] py-4 border-b border-paper-track',
        isToday ? 'bg-paper-alt -mx-[26px] px-[26px]' : ''
      ].join(' ')}
    >
      <div className="w-[42px] text-center shrink-0">
        <div className={`text-[10px] font-bold ${isToday ? 'text-azul' : 'text-ink-faintest'}`}>{weekdayShort(iso)}</div>
        <div className={`font-serif text-[24px] ${isToday ? 'text-ink' : 'text-ink-faintest'}`}>{fromISO(iso).getDate()}</div>
      </div>
      <div className="flex-1 min-w-0 pt-1 flex flex-col gap-[6px]">
        {sorted.length === 0 ? (
          <div className="text-[13px] text-paper-line">—</div>
        ) : (
          <>
            {visible.map((t) => {
              const overdue = t.carried_over && !t.done
              const days = overdue ? Math.max(1, diffDays(today, t.original_date)) : 0
              return (
                <div
                  key={t.id}
                  className={[
                    'text-[14px] truncate',
                    t.done ? 'text-ink-faintest line-through' : overdue ? 'text-rojo font-medium' : 'text-ink font-medium'
                  ].join(' ')}
                >
                  {t.title}
                  {overdue && <span className="text-[11px] font-bold ml-1">↷{days}</span>}
                </div>
              )
            })}
            {overflow > 0 && <div className="text-[13px] text-ink-faint">+ {overflow} más</div>}
          </>
        )}
      </div>
    </button>
  )
}
