import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { StatsSummary } from '../lib/types'
import { todayISO } from '../lib/dates'

export function useStats(userId: string | undefined) {
  const [stats, setStats] = useState<StatsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    supabase
      .rpc('stats_summary', { p_today: todayISO() })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error) setStats(data as StatsSummary)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return { stats, loading }
}
