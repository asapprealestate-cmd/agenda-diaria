import type { FontScale } from '../hooks/useFontScale'
import { FONT_SCALE_LABELS } from '../hooks/useFontScale'

const OPTIONS: FontScale[] = ['normal', 'grande', 'muy-grande']

export function SettingsScreen({
  scale,
  onChangeScale,
  onBack
}: {
  scale: FontScale
  onChangeScale: (s: FontScale) => void
  onBack: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col bg-paper font-sans">
      <div className="px-[26px] pt-[10px] pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-full border border-paper-line flex items-center justify-center text-ink"
          aria-label="Volver"
        >
          ‹
        </button>
      </div>

      <div className="flex-1 px-[26px] pb-8">
        <div className="font-serif text-[2rem] text-ink">Ajustes</div>

        <div className="mt-[26px]">
          <div className="text-[0.6875rem] font-bold tracking-[.14em] text-ink-faint">TAMAÑO DE LETRA</div>
          <p className="text-[0.875rem] text-ink-faint mt-1.5 leading-[1.5]">
            Para leer más cómodo, elegí el tamaño que mejor te quede.
          </p>

          <div className="flex flex-col gap-2 mt-4">
            {OPTIONS.map((opt) => {
              const selected = scale === opt
              return (
                <button
                  key={opt}
                  onClick={() => onChangeScale(opt)}
                  className={[
                    'flex items-center justify-between rounded-lg px-4 py-[14px] border transition text-left',
                    selected ? 'bg-ink border-ink' : 'border-paper-line'
                  ].join(' ')}
                >
                  <span
                    className={`font-serif ${selected ? 'text-ink-onDark' : 'text-ink'}`}
                    style={{ fontSize: opt === 'normal' ? '1rem' : opt === 'grande' ? '1.2rem' : '1.4rem' }}
                  >
                    {FONT_SCALE_LABELS[opt]}
                  </span>
                  {selected && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EEF1F3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-8 border-t border-paper-divider pt-5">
            <div className="text-[0.6875rem] font-bold tracking-[.14em] text-ink-faint mb-2">ASÍ SE VE</div>
            <p className="text-[0.9375rem] text-ink leading-[1.5]">
              Este es un ejemplo de cómo se va a ver el texto en toda la app con el tamaño que elijas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
