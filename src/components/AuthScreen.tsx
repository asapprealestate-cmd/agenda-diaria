import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (result.error) {
      setError(translateError(result.error))
      return
    }
    if (mode === 'signup') {
      setInfo('Cuenta creada. Si tu proyecto requiere confirmación, revisá tu email antes de entrar.')
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Escribí tu email arriba para poder enviarte el link.')
      return
    }
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setInfo(error ? null : 'Si esa cuenta existe, te enviamos un mail para recuperar la contraseña.')
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex flex-col px-8 bg-paper font-sans">
      <div className="mt-20">
        <div className="w-[46px] h-[46px] rounded-[10px] bg-ink text-ink-onDark flex items-center justify-center font-serif text-[26px]">
          A
        </div>
        <h1 className="font-serif text-[46px] leading-[1.05] text-ink mt-6">
          Tu agenda
          <br />
          de siempre.
        </h1>
        <p className="text-[15px] leading-[1.55] text-ink-faint mt-3">
          Lo que no hacés hoy aparece mañana. Como en papel, pero sin volver a escribirlo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-11 flex flex-col gap-[18px]">
        <label className="block">
          <div className="text-[11px] font-bold tracking-[.14em] text-ink-faint">MAIL</div>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@mail.com"
            className="w-full border-0 border-b-[1.5px] border-paper-line bg-transparent pt-[10px] pb-[9px] text-[16px] text-ink outline-none focus:border-azul placeholder:text-ink-faintest"
          />
        </label>

        <label className="block">
          <div className="text-[11px] font-bold tracking-[.14em] text-azul">CONTRASEÑA</div>
          <div className="flex items-center justify-between border-b-[1.5px] border-azul pt-[10px] pb-[9px]">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex-1 border-0 bg-transparent text-[16px] tracking-[.1em] text-ink outline-none placeholder:text-ink-faintest"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[13px] font-semibold text-azul shrink-0 ml-2"
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </label>

        {error && <p className="text-rojo text-sm">{error}</p>}
        {info && <p className="text-azul text-sm">{info}</p>}

        <div className="mt-4 flex flex-col gap-[14px]">
          <button
            type="submit"
            disabled={busy}
            className="bg-ink text-ink-onDark text-[16px] font-semibold py-4 rounded-lg text-center disabled:opacity-60"
          >
            {busy ? 'Un momento…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
          {mode === 'signin' && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-center text-[14px] font-semibold text-ink-faint"
            >
              Olvidé mi contraseña
            </button>
          )}
        </div>
      </form>

      <div className="mt-auto pb-10 pt-8 text-center text-[14px] text-ink-faint">
        {mode === 'signin' ? (
          <>
            ¿Primera vez?{' '}
            <button className="font-bold text-azul" onClick={() => setMode('signup')}>
              Crear cuenta
            </button>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta?{' '}
            <button className="font-bold text-azul" onClick={() => setMode('signin')}>
              Entrar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email.'
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  return msg
}
