import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useFontScale } from './hooks/useFontScale'
import { primeAudioUnlock } from './lib/audioUnlock'
import { AuthScreen } from './components/AuthScreen'
import { AgendaScreen } from './components/AgendaScreen'

export default function App() {
  const { session, loading } = useAuth()
  const fontScale = useFontScale()

  // Destraba el audio de la alarma con el primer toque en cualquier parte de
  // la app (en iOS, si no se hace así, el sonido de la alarma queda mudo).
  useEffect(() => {
    primeAudioUnlock()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="font-serif text-3xl text-ink-soft">Agenda Diaria…</p>
      </div>
    )
  }

  return session ? <AgendaScreen fontScale={fontScale} /> : <AuthScreen />
}
