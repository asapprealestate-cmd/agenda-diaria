import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function pluralDay(name: string) {
  return name.endsWith('s') ? name : `${name}s`
}

export function StatsScreen({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { stats, loading } = useStats(user?.id)

  const bars = stats?.bars ?? []
  const maxBar = Math.max(1, ...bars)

  let insight = 'Todavía no hay suficientes datos para sacar conclusiones.'
  if (stats && stats.day_stats.length >= 2) {
    const sorted = [...stats.day_stats].sort((a, b) => b.pct - a.pct)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    if (best.dow !== worst.dow) {
      insight = `Los ${pluralDay(DIAS[best.dow])} son tu mejor día. Los ${pluralDay(DIAS[worst.dow])}, el peor.`
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper font-sans">
      <div className="px-[26px] pt-[10px] pb-2 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 -ml-1 rounded-full border border-paper-line flex items-center justify-center text-ink" aria-label="Volver">
          ‹
        </button>
      </div>

      <div className="flex-1 px-[26px] pb-8 overflow-y-auto">
        <div className="font-serif text-[32px] text-ink">Cómo vas</div>
        <div className="text-[13px] text-ink-faint mt-0.5">últimos 30 días</div>

        {loading || !stats ? (
          <p className="text-center text-ink-faintest text-sm mt-10">Cargando…</p>
        ) : (
          <>
            <div className="mt-[22px] bg-ink rounded-xl p-[22px] text-ink-onDark">
              <div className="text-[11px] font-bold tracking-[.14em] text-ink-onDarkFaint">RACHA ACTUAL</div>
              <div className="flex items-baseline gap-2 mt-1">
                <div className="font-serif text-[62px] leading-none">{stats.streak}</div>
                <div className="text-[15px] text-ink-onDarkSoft">días seguidos anotando</div>
              </div>
              <div className="flex gap-[5px] mt-[18px]">
                {(bars.length ? bars : Array(10).fill(0)).map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 h-[26px] rounded-[3px]"
                    style={{ background: v === 0 ? '#2C3648' : v === maxBar ? '#0F5F8A' : '#4A87AC' }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-[10px] mt-[14px]">
              <div className="flex-1 border border-paper-line rounded-[10px] p-4">
                <div className="font-serif text-[34px] text-ink leading-none">
                  {stats.same_day_pct}
                  <span className="text-[20px]">%</span>
                </div>
                <div className="text-[12px] text-ink-faint mt-1.5 leading-[1.4]">tareas hechas el mismo día</div>
              </div>
              <div className="flex-1 border border-rojo-tintBorder bg-rojo-tint rounded-[10px] p-4">
                <div className="font-serif text-[34px] text-rojo leading-none">{stats.stuck_count}</div>
                <div className="text-[12px] text-rojo-dark mt-1.5 leading-[1.4]">arrastradas más de 3 días</div>
              </div>
            </div>

            {stats.categories.length > 0 && (
              <div className="mt-[26px]">
                <div className="text-[11px] font-bold tracking-[.14em] text-ink-faint">POR CATEGORÍA</div>
                <div className="flex flex-col gap-[14px] mt-[14px]">
                  {stats.categories.slice(0, 5).map((c) => (
                    <div key={c.category}>
                      <div className="flex justify-between text-[14px] text-ink mb-[6px]">
                        <span className="capitalize">{c.category.toLowerCase()}</span>
                        <span className="font-semibold text-ink-soft">{c.pct}%</span>
                      </div>
                      <div className="h-[6px] bg-paper-track rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.pct}%`, background: c.pct < 50 ? '#B4472A' : '#0F5F8A' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-[26px] border-t border-paper-divider pt-4">
              <div className="font-serif italic text-[19px] leading-[1.4] text-ink-soft">{insight}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
