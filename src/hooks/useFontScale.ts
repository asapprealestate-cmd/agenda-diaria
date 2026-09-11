import { useEffect, useState } from 'react'

export type FontScale = 'normal' | 'grande' | 'muy-grande' | 'mono'

const STORAGE_KEY = 'agenda-font-scale'
const VALID: FontScale[] = ['normal', 'grande', 'muy-grande', 'mono']

export const FONT_SCALE_LABELS: Record<FontScale, string> = {
  normal: 'Normal',
  grande: 'Grande',
  'muy-grande': 'Muy grande',
  mono: 'Mono'
}

function readStored(): FontScale {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (VALID.includes(v as FontScale)) return v as FontScale
  } catch {
    // localStorage no disponible (modo privado, etc.) — seguimos con el default
  }
  return 'normal'
}

/**
 * Tamaño de letra preferido por la persona, guardado en este dispositivo
 * (no viaja entre aparatos). Se aplica como atributo en <html> para que
 * todo el texto (definido en rem) escale junto vía CSS.
 */
export function useFontScale() {
  const [scale, setScale] = useState<FontScale>(readStored)

  useEffect(() => {
    document.documentElement.setAttribute('data-font-scale', scale)
    try {
      localStorage.setItem(STORAGE_KEY, scale)
    } catch {
      // nada que hacer si no se puede persistir
    }
  }, [scale])

  return { scale, setScale }
}
