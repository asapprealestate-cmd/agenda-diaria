import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Categorías usadas anteriormente por el usuario, para sugerir en el selector. */
export function useCategories(userId: string | undefined, refreshKey: number) {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    supabase
      .from('tasks')
      .select('category')
      .not('category', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        const unique = Array.from(new Set(data.map((r) => r.category as string)))
        setCategories(unique)
      })
    return () => {
      cancelled = true
    }
  }, [userId, refreshKey])

  return categories
}
