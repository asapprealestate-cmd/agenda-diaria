import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Category {
  id: string
  name: string
}

/** Categorías del usuario: se pueden crear y borrar (incluidas las de ejemplo). */
export function useCategoryList(userId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (!error && data) setCategories(data as Category[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  async function addCategory(name: string): Promise<Category | null> {
    const clean = name.trim().toUpperCase()
    if (!clean || !userId) return null

    const existing = categories.find((c) => c.name === clean)
    if (existing) return existing

    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name: clean, sort_order: categories.length })
      .select('id, name')
      .single()

    if (error || !data) {
      await load() // por si ya existía (choque de unique) y se nos desincronizó
      return categories.find((c) => c.name === clean) ?? null
    }
    const cat = data as Category
    setCategories((prev) => [...prev, cat])
    return cat
  }

  async function removeCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    await supabase.from('categories').delete().eq('id', id)
  }

  return { categories, loading, addCategory, removeCategory }
}
