import type { Task } from '../lib/types'
import { diffDays, formatTime, todayISO } from '../lib/dates'

function Checkbox({ done, overdue, onToggle }: { done: boolean; overdue: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label={done ? 'Marcar como no hecha' : 'Marcar como hecha'}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={[
        'w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 mt-[1px] transition',
        done ? 'bg-azul' : overdue ? 'border-[1.5px] border-rojo' : 'border-[1.5px] border-ink-faintest'
      ].join(' ')}
    >
      {done && (
        <svg className="check-mark" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

function TaskTags({ task }: { task: Task }) {
  const daysCarried = task.carried_over ? Math.max(1, diffDays(todayISO(), task.original_date)) : 0
  const hasTags = task.category || (task.carried_over && !task.done) || task.subtasks.length > 0
  if (!hasTags) return null
  return (
    <div className="flex flex-wrap items-center gap-[6px] mt-[6px]">
      {task.carried_over && !task.done && (
        <span className="text-[0.6875rem] font-bold text-rojo border border-rojo-tintBorder bg-rojo-tint rounded-[3px] px-[6px] py-[2px]">
          ↷ {daysCarried} {daysCarried === 1 ? 'DÍA' : 'DÍAS'}
        </span>
      )}
      {task.category && (
        <span className="text-[0.6875rem] font-semibold text-azul border border-azul-tintBorder rounded-[3px] px-[6px] py-[2px] uppercase">
          {task.category}
        </span>
      )}
      {task.subtasks.length > 0 && (
        <span className="text-[0.75rem] text-ink-faint">
          {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} subtareas
        </span>
      )}
    </div>
  )
}

export function TimelineRow({
  task,
  onToggle,
  onOpen
}: {
  task: Task
  onToggle: (t: Task) => void
  onOpen: (t: Task) => void
}) {
  const overdue = task.carried_over && !task.done
  return (
    <div className="flex gap-[14px] fade-in-up cursor-pointer" onClick={() => onOpen(task)}>
      <div className="w-11 pt-[2px] text-[0.8125rem] font-semibold text-right shrink-0" style={{ color: task.done ? '#9AA1AA' : '#4C5361' }}>
        {formatTime(task.time)}
      </div>
      <div className="w-px shrink-0 relative" style={{ background: '#D3D7DB' }}>
        <div
          className="absolute w-[9px] h-[9px] rounded-full -left-[4px] top-[6px]"
          style={{ background: overdue ? '#B4472A' : '#0F5F8A' }}
        />
      </div>
      <div className="flex-1 pb-[18px] flex gap-[10px] items-start min-w-0">
        <Checkbox done={task.done} overdue={overdue} onToggle={() => onToggle(task)} />
        <div className="flex-1 min-w-0">
          <div className={`text-[0.9375rem] font-medium whitespace-nowrap hscroll ${task.done ? 'text-ink-faintest line-through' : 'text-ink'}`}>
            {task.priority === 1 && !task.done && <span className="text-rojo font-bold mr-1">!!</span>}
            {task.title}
          </div>
          <TaskTags task={task} />
        </div>
      </div>
    </div>
  )
}

export function LooseRow({
  task,
  onToggle,
  onOpen
}: {
  task: Task
  onToggle: (t: Task) => void
  onOpen: (t: Task) => void
}) {
  const overdue = task.carried_over && !task.done
  return (
    <div className="flex gap-[10px] items-start fade-in-up cursor-pointer" onClick={() => onOpen(task)}>
      <Checkbox done={task.done} overdue={overdue} onToggle={() => onToggle(task)} />
      <div className="flex-1 min-w-0">
        <div className={`text-[0.9375rem] font-medium truncate ${task.done ? 'text-ink-faintest line-through' : 'text-ink'}`}>
          {task.priority === 1 && !task.done && <span className="text-rojo font-bold mr-1">!!</span>}
          {task.title}
        </div>
        <TaskTags task={task} />
      </div>
    </div>
  )
}
