export function InstallGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] sm:mb-8 sm:rounded-[24px] bg-paper rounded-t-[26px] shadow-sheet sheet-in p-[26px] pb-8">
        <div className="font-serif text-[1.5rem] text-ink mb-2">Para que te lleguen los avisos</div>
        <p className="text-[0.9375rem] text-ink-faint leading-[1.5] mb-5">
          En iPhone, Apple exige instalar la app para poder mandar notificaciones y alarmas. Es simple:
        </p>

        <ol className="flex flex-col gap-4 mb-6">
          <Step n={1}>
            Tocá el ícono de <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba) abajo en Safari.
          </Step>
          <Step n={2}>
            Elegí <strong>"Agregar a la pantalla de inicio"</strong>.
          </Step>
          <Step n={3}>
            Abrí la Agenda desde ese ícono nuevo (no desde Safari) y volvé a activar la alarma ahí.
          </Step>
        </ol>

        <button onClick={onClose} className="w-full bg-ink text-ink-onDark text-[0.9375rem] font-semibold py-[14px] rounded-lg">
          Entendido
        </button>
      </div>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="w-[24px] h-[24px] shrink-0 rounded-full bg-azul-tint text-azul text-[0.8125rem] font-bold flex items-center justify-center">
        {n}
      </span>
      <span className="text-[0.9375rem] text-ink leading-[1.5] pt-[1px]">{children}</span>
    </li>
  )
}
