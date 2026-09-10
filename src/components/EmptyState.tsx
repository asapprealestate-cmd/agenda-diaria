export function EmptyState({
  onAdd,
  onCopyYesterday,
  canCopyYesterday
}: {
  onAdd: () => void
  onCopyYesterday: () => void
  canCopyYesterday: boolean
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[22px] px-9 text-center">
      <div
        className="w-32 h-[156px] border border-paper-line rounded-[3px] bg-paper-alt p-[14px_12px] flex flex-col gap-[13px]"
        style={{ transform: 'rotate(-3deg)' }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-px bg-paper-track" />
        ))}
      </div>
      <div>
        <div className="font-serif text-[1.6875rem] leading-[1.2] text-ink">Hoja en blanco</div>
        <p className="mt-2 text-[0.875rem] leading-[1.55] text-ink-faint">
          No hay nada anotado para este día. Nada arrastrado tampoco.
        </p>
      </div>
      <div className="flex flex-col gap-[10px] w-full">
        <button
          onClick={onAdd}
          className="bg-ink text-ink-onDark text-[0.9375rem] font-semibold py-[14px] rounded-lg"
        >
          Anotar una tarea
        </button>
        {canCopyYesterday && (
          <button onClick={onCopyYesterday} className="text-[0.875rem] font-semibold text-azul py-3">
            Copiar el día de ayer
          </button>
        )}
      </div>
    </div>
  )
}
