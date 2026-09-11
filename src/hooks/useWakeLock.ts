import { useEffect, useRef } from 'react'

/**
 * Evita que la pantalla se apague/bloquee sola mientras `active` es true.
 * En iPhone esto es clave para las alarmas: si la pantalla se apaga, Safari
 * congela la página (los setInterval dejan de correr) y ninguna alarma puede
 * sonar, sin importar qué tan bien esté armado el resto. Sin esto, alcanza
 * con que la persona deje el celular sobre la mesa esperando para que el
 * bloqueo automático (a los 30s) rompa todo silenciosamente.
 */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let cancelled = false

    async function acquire() {
      try {
        lockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // el navegador la puede rechazar (poco batería, pestaña no visible, etc.) — no hay más para hacer
      }
    }

    function onVisibility() {
      // el navegador libera la traba sola al perder visibilidad; hay que
      // volver a pedirla cuando la persona vuelve a mirar la pantalla
      if (document.visibilityState === 'visible' && !cancelled) acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      lockRef.current?.release().catch(() => {})
      lockRef.current = null
    }
  }, [active])
}
