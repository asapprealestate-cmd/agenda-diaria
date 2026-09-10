import type { Task } from '../lib/types'
import { TimelineRow, LooseRow } from './TaskRow'

function sortByTime(a: Task, b: Task) {
  return (a.time ?? '').localeCompare(b.time ?? '')
}

export function TimelineSection({
  tasks,
  onToggle,
  onOpen
}: {
  tasks: Task[]
  onToggle: (t: Task) => void
  onOpen: (t: Task) => void
}) {
  const withTime = tasks.filter((t) => t.time).sort(sortByTime)
  if (withTime.length === 0) return null

  return (
    <section className="mb-1">
      <h2 className="text-[0.6875rem] font-bold tracking-[.14em] text-ink-faint mb-3">CON HORARIO</h2>
      <div className="flex flex-col">
        {withTime.map((t) => (
          <TimelineRow key={t.id} task={t} onToggle={onToggle} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

export function LooseTaskSection({
  tasks,
  onToggle,
  onOpen
}: {
  tasks: Task[]
  onToggle: (t: Task) => void
  onOpen: (t: Task) => void
}) {
  const withoutTime = tasks.filter((t) => !t.time)
  if (withoutTime.length === 0) return null

  return (
    <section className="border-t border-paper-divider pt-4 mt-1">
      <h2 className="text-[0.6875rem] font-bold tracking-[.14em] text-ink-faint mb-3">SUELTAS</h2>
      <div className="flex flex-col gap-[14px]">
        {withoutTime.map((t) => (
          <LooseRow key={t.id} task={t} onToggle={onToggle} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}
