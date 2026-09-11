import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/dates'
import type { RingingAlarm } from './usePushNotifications'

const CHECK_EVERY_MS = 10000
const DUE_WINDOW_MS = 3 * 60000 // margen amplio, por si hubo algún freeze momentáneo

interface AlarmRow {
  id: string
  title: string
  time: string
  date: string
  alarm_offset_minutes: number
}

/**
 * En iPhone, Safari no le avisa de forma confiable a la página (aunque esté
 * abierta) cuando llega un push — así que la alarma nunca sonaba ahí. Esto
 * evita depender de eso: mientras la app está abierta, ella misma se fija
 * cada pocos segundos si alguna de sus propias tareas tiene una alarma que
 * ya debería estar sonando, y la dispara directamente (mismo mecanismo que
 * ya funciona en computadora/Android).
 */
export function useAlarmWatcher(userId: string | undefined, onRing: (alarm: RingingAlarm) => void) {
  const rungRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function check() {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, time, date, alarm_offset_minutes')
        .eq('date', todayISO())
        .eq('alarm_enabled', true)
        .eq('done', false)
        .not('time', 'is', null)

      if (cancelled || error || !data) return

      const now = Date.now()
      for (const t of data as AlarmRow[]) {
        if (rungRef.current.has(t.id)) continue

        const [y, mo, d] = t.date.split('-').map(Number)
        const [h, mi, s] = t.time.split(':').map(Number)
        const target = new Date(y, mo - 1, d, h, mi, s || 0).getTime() - t.alarm_offset_minutes * 60000

        const diff = now - target
        if (diff >= 0 && diff < DUE_WINDOW_MS) {
          rungRef.current.add(t.id)
          onRing({ title: t.title, body: `⏰ Alarma · ${t.time.slice(0, 5)}` })
        }
      }
    }

    check()
    const interval = setInterval(check, CHECK_EVERY_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])
}
