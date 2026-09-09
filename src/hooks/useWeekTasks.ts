import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../lib/types'
import { addDays } from '../lib/dates'

export function useWeekTasks(weekStart: string, userId: string | undefined) {
  const [byDate, setByDate] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    const weekEnd = addDays(weekStart, 6)
    supabase
      .from('tasks')
      .select('*')
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) {
          const grouped: Record<string, Task[]> = {}
          for (const t of data as Task[]) {
            ;(grouped[t.date] ??= []).push(t)
          }
          setByDate(grouped)
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [weekStart, userId])

  return { byDate, loading }
}
