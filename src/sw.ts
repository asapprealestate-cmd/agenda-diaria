/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

// La API de Supabase: si no hay red, que no rompa (aunque sin conexión igual
// no hay datos frescos para mostrar).
registerRoute(
  ({ url }) => url.hostname.endsWith('supabase.co'),
  new NetworkFirst({ cacheName: 'supabase-api', networkTimeoutSeconds: 5 })
)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// --- Notificaciones push (recordatorios y alarmas de tareas) ---

interface ReminderPayload {
  title: string
  body: string
  tag: string
  alarm: boolean
}

self.addEventListener('push', (event: PushEvent) => {
  let payload: ReminderPayload
  try {
    payload = event.data!.json()
  } catch {
    return
  }

  const options: NotificationOptions & { vibrate?: number[] } = {
    body: payload.body,
    tag: payload.tag,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: payload.alarm ? [500, 200, 500, 200, 500, 200, 500] : [200],
    requireInteraction: payload.alarm,
    data: { taskId: payload.tag, alarm: payload.alarm }
  }
  const notify = self.registration.showNotification(payload.title, options)

  // Si la app está abierta en ese momento, además le avisamos a la página
  // para que haga sonar una alarma de verdad (con audio en loop) — eso el
  // service worker solo no lo puede hacer.
  const notifyClients = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      client.postMessage({ type: 'task-reminder', alarm: payload.alarm, title: payload.title, body: payload.body })
    }
  })

  event.waitUntil(Promise.all([notify, notifyClients]))
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus()
        clients[0].postMessage({ type: 'notification-click', alarm: event.notification.data?.alarm })
        return
      }
      return self.clients.openWindow('/')
    })
  )
})
