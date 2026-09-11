// iOS (y varios navegadores mobile) solo dejan arrancar audio si el
// AudioContext se creó/reanudó durante un toque real de la persona. Un aviso
// que llega solo (por push) no cuenta como ese toque, así que si creamos el
// AudioContext recién ahí, iOS lo deja mudo sin avisar.
//
// El truco: "destrabamos" un único AudioContext compartido apenas la persona
// toca cualquier parte de la app por primera vez, y lo reusamos después para
// hacer sonar la alarma — ya queda desbloqueado para el resto de la sesión.
let sharedCtx: AudioContext | null = null
let primed = false

function createCtx(): AudioContext | null {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  try {
    return new AudioCtx()
  } catch {
    return null
  }
}

export function primeAudioUnlock() {
  if (primed) return
  primed = true

  function unlock() {
    if (!sharedCtx) sharedCtx = createCtx()
    if (!sharedCtx) return
    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume().catch(() => {})
    }
    // buffer de un frame, inaudible, solo para terminar de destrabar en iOS
    const buffer = sharedCtx.createBuffer(1, 1, 22050)
    const source = sharedCtx.createBufferSource()
    source.buffer = buffer
    source.connect(sharedCtx.destination)
    source.start(0)

    document.removeEventListener('touchstart', unlock)
    document.removeEventListener('click', unlock)
  }

  document.addEventListener('touchstart', unlock, { passive: true })
  document.addEventListener('click', unlock)
}

/** El AudioContext ya destrabado (o uno nuevo si todavía no hubo ningún toque). */
export function getSharedAudioContext(): AudioContext | null {
  if (!sharedCtx) sharedCtx = createCtx()
  return sharedCtx
}
