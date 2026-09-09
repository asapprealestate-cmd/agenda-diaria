import { useAuth } from './hooks/useAuth'
import { AuthScreen } from './components/AuthScreen'
import { AgendaScreen } from './components/AgendaScreen'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="font-serif text-3xl text-ink-soft">Agenda Diaria…</p>
      </div>
    )
  }

  return session ? <AgendaScreen /> : <AuthScreen />
}
