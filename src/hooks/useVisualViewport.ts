import { useEffect, useState } from 'react'

/**
 * En iOS, cuando aparece el teclado, `100vh`/`fixed inset-0` siguen midiendo
 * la pantalla completa (el teclado se superpone), así que una hoja anclada
 * abajo con `items-end` termina fuera de la parte visible, tapada por el
 * teclado. `visualViewport` sí conoce el alto real que queda visible.
 *
 * Devuelve null si el navegador no soporta `visualViewport` (ahí se usa
 * el fallback normal de `100vh`).
 */
export function useVisualViewport() {
  const [viewport, setViewport] = useState<{ height: number; offsetTop: number } | null>(null)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    function update() {
      setViewport({ height: vv!.height, offsetTop: vv!.offsetTop })
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return viewport
}
