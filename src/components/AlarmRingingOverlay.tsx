import { useEffect, useRef } from 'react'
import type { RingingAlarm } from '../hooks/usePushNotifications'

export function AlarmRingingOverlay({ alarm, onDismiss }: { alarm: RingingAlarm; onDismiss: () => void }) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const stopRef = useRef(false)

  useEffect(() => {
    stopRef.current = false
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    audioCtxRef.current = ctx

    function beep(startAt: number, freq: number, duration: number) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, startAt)
      gain.gain.exponentialRampToValueAtTime(0.35, startAt + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startAt)
      osc.stop(startAt + duration)
    }

    function playPattern() {
      if (stopRef.current) return
      const now = ctx.currentTime
      beep(now, 880, 0.25)
      beep(now + 0.35, 880, 0.25)
      beep(now + 0.7, 660, 0.4)
    }

    playPattern()
    const interval = setInterval(playPattern, 1400)

    let vibrateInterval: number | undefined
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500])
      vibrateInterval = window.setInterval(() => navigator.vibrate([500, 200, 500, 200, 500]), 1400)
    }

    return () => {
      stopRef.current = true
      clearInterval(interval)
      if (vibrateInterval) clearInterval(vibrateInterval)
      navigator.vibrate?.(0)
      ctx.close()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-ink-onDark px-8 text-center">
      <div className="text-[64px] leading-none mb-6 animate-pulse">⏰</div>
      <div className="font-serif text-[1.75rem] leading-[1.2]">{alarm.title}</div>
      <p className="text-[0.9375rem] text-ink-onDarkSoft mt-2">{alarm.body}</p>
      <button
        onClick={onDismiss}
        className="mt-12 w-full max-w-xs bg-rojo text-ink-onDark text-[1.0625rem] font-bold py-4 rounded-full active:scale-95 transition"
      >
        Apagar alarma
      </button>
    </div>
  )
}
