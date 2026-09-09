import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NewTaskInput, Task } from '../lib/types'
import { addDays, todayISO } from '../lib/dates'

export function useTasks(date: string, userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', date)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setTasks(data as Task[])
    setLoading(false)
  }, [date, userId])

  useEffect(() => {
    load()
  }, [load])

  async function addTask(input: NewTaskInput) {
    if (!userId) return
    const maxOrder = tasks.reduce((m, t) => Math.max(m, t.sort_order), 0)
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: input.title,
        time: input.time,
        category: input.category,
        priority: input.priority,
        subtasks: input.subtasks,
        auto_rollover: input.auto_rollover,
        date,
        original_date: date,
        sort_order: maxOrder + 1
      })
      .select()
      .single()
    if (error) {
      setError(error.message)
      return
    }
    setTasks((prev) => [...prev, data as Task])
  }

  async function updateTask(task: Task, input: NewTaskInput) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: input.title,
        time: input.time,
        category: input.category,
        priority: input.priority,
        subtasks: input.subtasks,
        auto_rollover: input.auto_rollover
      })
      .eq('id', task.id)
      .select()
      .single()
    if (error) {
      setError(error.message)
      return
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? (data as Task) : t)))
  }

  async function toggleDone(task: Task) {
    const done = !task.done
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done, done_at: done ? new Date().toISOString() : null } : t))
    )
    const { error } = await supabase
      .from('tasks')
      .update({ done, done_at: done ? new Date().toISOString() : null })
      .eq('id', task.id)
    if (error) {
      setError(error.message)
      load()
    }
  }

  async function deleteTask(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    const { error } = await supabase.from('tasks').delete().eq('id', task.id)
    if (error) {
      setError(error.message)
      load()
    }
  }

  /** Trae las tareas del día anterior tal cual están (para "Copiar el día de ayer"). */
  async function fetchYesterday(): Promise<Task[]> {
    if (!userId) return []
    const { data } = await supabase.from('tasks').select('*').eq('date', addDays(date, -1))
    return (data as Task[]) ?? []
  }

  async function copyFromYesterday() {
    const yesterdayTasks = await fetchYesterday()
    if (yesterdayTasks.length === 0 || !userId) return
    const maxOrder = tasks.reduce((m, t) => Math.max(m, t.sort_order), 0)
    const rows = yesterdayTasks.map((t, i) => ({
      user_id: userId,
      title: t.title,
      time: t.time,
      category: t.category,
      priority: t.priority,
      subtasks: (t.subtasks ?? []).map((s) => ({ ...s, done: false })),
      auto_rollover: t.auto_rollover,
      date,
      original_date: date,
      sort_order: maxOrder + i + 1
    }))
    const { data, error } = await supabase.from('tasks').insert(rows).select()
    if (error) {
      setError(error.message)
      return
    }
    setTasks((prev) => [...prev, ...((data as Task[]) ?? [])])
  }

  return {
    tasks,
    loading,
    error,
    reload: load,
    addTask,
    updateTask,
    toggleDone,
    deleteTask,
    fetchYesterday,
    copyFromYesterday
  }
}

/** Corre una vez por sesión: arrastra al día de hoy las tareas sin hacer de días anteriores. */
export async function runRollover() {
  const { error } = await supabase.rpc('rollover_tasks', { p_today: todayISO() })
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error en rollover:', error.message)
  }
}
