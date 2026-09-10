import { useState } from 'react'
import type { NewTaskInput, Priority, Subtask, Task } from '../lib/types'
import type { Category } from '../hooks/useCategoryList'
import { useVisualViewport } from '../hooks/useVisualViewport'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function AddTaskSheet({
  task,
  categories,
  onAddCategory,
  onRemoveCategory,
  onSave,
  onDelete,
  onClose
}: {
  task?: Task
  categories: Category[]
  onAddCategory: (name: string) => Promise<Category | null>
  onRemoveCategory: (id: string) => void
  onSave: (input: NewTaskInput) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [hasTime, setHasTime] = useState(!!task?.time)
  const [time, setTime] = useState(task?.time?.slice(0, 5) ?? '09:00')
  const [category, setCategory] = useState<string | null>(task?.category ?? null)
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 2)
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks ?? [])
  const [newSubtask, setNewSubtask] = useState('')
  const [autoRollover, setAutoRollover] = useState(task?.auto_rollover ?? true)
  const viewport = useVisualViewport()

  // Si la tarea tiene una categoría que ya no está en la lista (se borró), la mostramos
  // igual para no perderla, pero sin botón de borrar (no hay a qué categoría apuntar).
  const displayCategories: { id: string | null; name: string }[] = [
    ...categories,
    ...(category && !categories.some((c) => c.name === category) ? [{ id: null, name: category }] : [])
  ]

  function addSubtask() {
    const t = newSubtask.trim()
    if (!t) return
    setSubtasks((prev) => [...prev, { id: uid(), title: t, done: false }])
    setNewSubtask('')
  }

  function toggleSubtask(id: string) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)))
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  async function addCustomCategory() {
    const name = window.prompt('Nombre de la nueva categoría')?.trim()
    if (!name) return
    const cat = await onAddCategory(name)
    if (cat) setCategory(cat.name)
  }

  function handleRemoveCategory(e: React.MouseEvent, id: string | null, name: string) {
    e.stopPropagation()
    if (category === name) setCategory(null)
    if (id) onRemoveCategory(id)
  }

  function handleSave() {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      time: hasTime ? `${time}:00` : null,
      category,
      priority,
      subtasks,
      auto_rollover: autoRollover
    })
  }

  // En iOS, cuando se abre el teclado, la pantalla "completa" (100vh) sigue
  // midiendo lo mismo pero el teclado tapa la parte de abajo. Anclamos la hoja
  // al alto que realmente queda visible (visualViewport) para que no quede
  // escondida detrás del teclado.
  const sheetStyle = viewport
    ? { top: viewport.offsetTop, height: viewport.height }
    : { top: 0, height: '100vh' }
  const sheetMaxHeight = viewport ? viewport.height * 0.94 : undefined

  return (
    <div className="fixed left-0 right-0 z-50 flex items-end justify-center" style={sheetStyle}>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        className="relative w-full sm:w-[420px] sm:mb-8 sm:rounded-[24px] bg-paper rounded-t-[26px] shadow-sheet sheet-in max-h-[92vh] flex flex-col"
        style={sheetMaxHeight ? { maxHeight: sheetMaxHeight } : undefined}
      >
        <div className="px-[26px] pt-5 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="text-[0.9375rem] font-semibold text-ink-faint">
            Cancelar
          </button>
          <span className="font-serif text-[1.25rem] text-ink">{task ? 'Editar tarea' : 'Nueva tarea'}</span>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="text-[0.9375rem] font-bold text-azul disabled:opacity-40"
          >
            Guardar
          </button>
        </div>

        <div className="px-[26px] pb-6 overflow-y-auto grow mt-[26px]">
          <div className="border-b-[1.5px] border-ink pb-[10px]">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué hay que hacer?"
              className="w-full border-0 bg-transparent font-serif text-[1.625rem] text-ink outline-none placeholder:text-ink-faintest"
            />
          </div>
          <div className="text-[0.75rem] text-ink-faintest mt-2">Escribí qué hay que hacer</div>

          <div className="mt-[26px]">
            <div className="text-[0.6875rem] font-bold tracking-[.14em] text-ink-faint">HORARIO</div>
            <div className="flex gap-2 mt-[10px]">
              <button
                onClick={() => setHasTime(false)}
                className={[
                  'flex-1 text-center text-[0.875rem] font-semibold py-[11px] rounded-[7px] transition',
                  !hasTime ? 'bg-ink text-ink-onDark' : 'border border-paper-line text-ink-soft'
                ].join(' ')}
              >
                Sin horario
              </button>
              <button
                onClick={() => setHasTime(true)}
                className={[
                  'flex-1 text-center text-[0.875rem] font-semibold py-[11px] rounded-[7px] transition',
                  hasTime ? 'bg-ink text-ink-onDark' : 'border border-paper-line text-ink-soft'
                ].join(' ')}
              >
                A las…
              </button>
            </div>
            {hasTime && (
              <div className="mt-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="text-[0.9375rem] font-semibold text-ink border border-paper-line rounded-lg px-[13px] py-[9px] bg-transparent outline-none focus:border-azul"
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="text-[0.6875rem] font-bold tracking-[.14em] text-ink-faint">CATEGORÍA Y PRIORIDAD</div>
            <div className="flex flex-wrap gap-2 mt-[10px]">
              {displayCategories.map((c) => {
                const selected = category === c.name
                return (
                  <div key={c.name} className="relative">
                    <button
                      onClick={() => setCategory(selected ? null : c.name)}
                      className={[
                        'text-[0.75rem] font-semibold rounded-[3px] pl-[10px] pr-[22px] py-[6px] border transition',
                        selected ? 'text-azul bg-azul-tint border-azul-tintBorder' : 'text-ink-faint border-paper-line'
                      ].join(' ')}
                    >
                      {c.name}
                    </button>
                    {c.id && (
                      <button
                        onClick={(e) => handleRemoveCategory(e, c.id, c.name)}
                        aria-label={`Borrar categoría ${c.name}`}
                        className={[
                          'absolute right-[4px] top-1/2 -translate-y-1/2 text-[0.8125rem] leading-none',
                          selected ? 'text-azul' : 'text-ink-faintest'
                        ].join(' ')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
              <button
                onClick={addCustomCategory}
                className="text-[0.75rem] font-semibold text-ink-faint border border-dashed border-paper-line rounded-[3px] px-[10px] py-[6px]"
              >
                + nueva
              </button>
            </div>

            <div className="flex gap-2 mt-3 items-center">
              <span className="text-[0.8125rem] text-ink-faint">Prioridad</span>
              <div className="flex gap-[6px]">
                <button
                  onClick={() => setPriority(1)}
                  className={[
                    'text-[0.875rem] font-bold rounded-[4px] px-[10px] py-[5px] border transition',
                    priority === 1 ? 'bg-rojo text-ink-onDark border-rojo' : 'text-rojo border-rojo-tintBorder'
                  ].join(' ')}
                >
                  !!
                </button>
                <button
                  onClick={() => setPriority(2)}
                  className={[
                    'text-[0.875rem] font-bold rounded-[4px] px-[10px] py-[5px] border transition',
                    priority === 2 ? 'bg-ink text-ink-onDark border-ink' : 'text-ink-faint border-paper-line'
                  ].join(' ')}
                >
                  !
                </button>
                <button
                  onClick={() => setPriority(3)}
                  className={[
                    'text-[0.875rem] font-bold rounded-[4px] px-[10px] py-[5px] border transition',
                    priority === 3 ? 'bg-ink-faintest text-ink-onDark border-ink-faintest' : 'text-ink-faintest border-paper-line'
                  ].join(' ')}
                >
                  –
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[0.6875rem] font-bold tracking-[.14em] text-ink-faint">SUBTAREAS</div>
            <div className="flex flex-col gap-[11px] mt-3">
              {subtasks.map((s) => (
                <div key={s.id} className="flex gap-[10px] items-center group">
                  <button
                    onClick={() => toggleSubtask(s.id)}
                    className={[
                      'w-[17px] h-[17px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0',
                      s.done ? 'bg-azul border-azul' : 'border-ink-faintest'
                    ].join(' ')}
                  >
                    {s.done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-[0.875rem] flex-1 ${s.done ? 'text-ink-faintest line-through' : 'text-ink'}`}>
                    {s.title}
                  </span>
                  <button
                    onClick={() => removeSubtask(s.id)}
                    className="text-ink-faintest text-[0.75rem] opacity-0 group-hover:opacity-100"
                    aria-label="Quitar subtarea"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-[10px] items-center">
                <div className="w-[17px] h-[17px] rounded-[4px] border-[1.5px] border-dashed border-paper-line shrink-0" />
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSubtask()
                    }
                  }}
                  onBlur={addSubtask}
                  placeholder="Agregar subtarea"
                  className="text-[0.875rem] text-ink flex-1 bg-transparent outline-none placeholder:text-ink-faintest"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-[26px] pb-6 pt-4 border-t border-paper-divider shrink-0">
          <div className="flex justify-between items-center text-[0.8125rem]">
            <span className="text-ink-faint">Si no la hago, se pasa sola a mañana</span>
            <button onClick={() => setAutoRollover((v) => !v)} className="font-bold text-azul">
              {autoRollover ? 'Sí' : 'No'}
            </button>
          </div>
          {task && onDelete && (
            <button onClick={onDelete} className="w-full text-center text-[0.8125rem] font-semibold text-rojo mt-4">
              Eliminar tarea
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
