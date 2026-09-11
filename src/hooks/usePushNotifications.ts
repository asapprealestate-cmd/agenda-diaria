import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { pushSupported, urlBase64ToUint8Array } from '../lib/push'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

export interface RingingAlarm {
  title: string
  body: string
}

export function usePushNotifications(userId: string | undefined) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    pushSupported() ? Notification.permission : 'unsupported'
  )
  const [busy, setBusy] = useState(false)
  const [ringingAlarm, setRingingAlarm] = useState<RingingAlarm | null>(null)

  // Escucha los mensajes que manda el service worker cuando llega un push
  // con la app abierta, para poder hacer sonar la alarma de verdad acá.
  useEffect(() => {
    if (!pushSupported()) return
    function onMessage(event: MessageEvent) {
      if (event.data?.type === 'task-reminder' && event.data.alarm) {
        setRingingAlarm({ title: event.data.title, body: event.data.body })
      }
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [])

  async function enable(): Promise<boolean> {
    if (!pushSupported() || !userId) return false
    setBusy(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return false

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
        })
      }

      const json = subscription.toJSON()
      await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth
        },
        { onConflict: 'endpoint' }
      )

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      await supabase.from('user_settings').upsert({ user_id: userId, timezone }, { onConflict: 'user_id' })

      return true
    } finally {
      setBusy(false)
    }
  }

  return { permission, busy, enable, ringingAlarm, dismissRinging: () => setRingingAlarm(null) }
}
