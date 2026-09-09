import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { runRollover, useTasks } from '../hooks/useTasks'
import { useCategoryList } from '../hooks/useCategoryList'
import { addDays, startOfWeek, todayISO } from '../lib/dates'
import type { Task } from '../lib/types'
import { DateHeader } from './DateHeader'
import { CalendarModal } from './CalendarModal'
import { TimelineSection, LooseTaskSection } from './TaskSections'
import { AddTaskSheet } from './AddTaskSheet'
import { EmptyState } from './EmptyState'
import { WeeklyView } from './WeeklyView'
import { StatsScreen } from './StatsScreen'

type ViewMode = 'day' | 'week' | 'stats'

export function AgendaScreen() {
  const { user, signOut } = useAuth()
  const [date, setDate] = useState(todayISO())
  const [view, setView] = useState<ViewMode>('day')
  const [showCalendar, setShowCalendar] = useState(false)
  const [sheetTask, setSheetTask] = useState<Task | 'new' | null>(null)
  const [rolledOver, setRolledOver] = useState(false)
  const [yesterdayHasTasks, setYesterdayHasTasks] = useState<boolean | null>(null)

  const { tasks, loading, error, addTask, updateTask, toggleDone, deleteTask, fetchYesterday, copyFromYesterday } =
    useTasks(date, user?.id)
  const { categories, addCategory, removeCategory } = useCategoryList(user?.id)

  useEffect(() => {
    if (!user || rolledOver) return
    runRollover().then(() => setRolledOver(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, rolledOver])

  useEffect(() => {
    if (!loading && tasks.length === 0) {
      fetchYesterday().then((t) => setYesterdayHasTasks(t.length > 0))
    } else {
      setYesterdayHasTasks(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, tasks.length, date])

  const touchStartX = useRef<number | null>(null)
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 60) setDate((d) => addDays(d, delta > 0 ? -1 : 1))
    touchStartX.current = null
  }

  if (view === 'week') {
    return (
      <WeeklyView
        weekStart={startOfWeek(date)}
        onSelectDay={(iso) => {
          setDate(iso)
          setView('day')
        }}
        onBack={() => setView('day')}
      />
    )
  }

  if (view === 'stats') {
    return <StatsScreen onBack={() => setView('day')} />
  }

  const doneCount = tasks.filter((t) => t.done).length
  const editingTask = sheetTask && sheetTask !== 'new' ? sheetTask : undefined

  return (
    <div className="min-h-screen flex flex-col bg-paper font-sans" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex justify-end items-center gap-4 px-[26px] pt-3">
        <button onClick={() => setView('stats')} className="text-[13px] font-semibold text-ink-faint">
          Cómo vas
        </button>
        <button onClick={signOut} className="text-[13px] text-ink-faintest">
          Salir
        </button>
      </div>

      <DateHeader
        date={date}
        doneCount={doneCount}
        totalCount={tasks.length}
        onPrev={() => setDate((d) => addDays(d, -1))}
        onNext={() => setDate((d) => addDays(d, 1))}
        onOpenCalendar={() => setShowCalendar(true)}
        onOpenWeek={() => setView('week')}
      />

      {error && (
        <p className="mx-[26px] mt-3 text-sm text-rojo bg-rojo-tint rounded-lg px-3 py-2">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-ink-faintest text-sm mt-10">Cargando…</p>
      ) : tasks.length === 0 ? (
        <EmptyState
          onAdd={() => setSheetTask('new')}
          onCopyYesterday={() => copyFromYesterday()}
          canCopyYesterday={!!yesterdayHasTasks}
        />
      ) : (
        <div className="flex-1 px-[26px] pt-[18px] pb-28">
          <TimelineSection tasks={tasks} onToggle={toggleDone} onOpen={setSheetTask} />
          <LooseTaskSection tasks={tasks} onToggle={toggleDone} onOpen={setSheetTask} />
        </div>
      )}

      <button
        onClick={() => setSheetTask('new')}
        aria-label="Agregar tarea"
        className="fixed right-[22px] bottom-10 w-[62px] h-[62px] rounded-full bg-ink text-ink-onDark shadow-sheet flex items-center justify-center text-[30px] font-light active:scale-95 transition"
      >
        +
      </button>

      {showCalendar && <CalendarModal selected={date} onSelect={setDate} onClose={() => setShowCalendar(false)} />}

      {sheetTask && (
        <AddTaskSheet
          task={editingTask}
          categories={categories}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
          onClose={() => setSheetTask(null)}
          onSave={(input) => {
            if (editingTask) updateTask(editingTask, input)
            else addTask(input)
            setSheetTask(null)
          }}
          onDelete={
            editingTask
              ? () => {
                  deleteTask(editingTask)
                  setSheetTask(null)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
