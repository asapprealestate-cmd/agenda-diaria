import { useLayoutEffect } from 'react'

/**
 * Para encabezados de una sola línea (la fecha del día, el mes del calendario,
 * el rango de la semana) que no deben ni cortarse ni bajar de renglón: si con
 * el tamaño de letra elegido no entran en el ancho disponible, se achica SOLO
 * ese texto lo justo para que entre — sin importar el tamaño general elegido
 * en Ajustes. Si entra bien, no toca nada.
 *
 * El elemento debe tener `whitespace-nowrap` (y preferentemente `overflow-hidden`
 * y `min-w-0` si vive dentro de un flex) para que la medición tenga sentido.
 */
export function useFitOneLine<T extends HTMLElement>(ref: React.RefObject<T>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    function fit() {
      if (!el) return
      el.style.fontSize = '' // volvemos al tamaño "ideal" (CSS) antes de medir
      const available = el.clientWidth
      let natural = el.scrollWidth
      if (available <= 0 || natural <= available) return

      const computedPx = parseFloat(getComputedStyle(el).fontSize)
      let next = computedPx * (available / natural) * 0.96
      el.style.fontSize = `${Math.max(next, 11)}px`

      // segunda pasada por si el cálculo no dio exacto (kerning, redondeo)
      natural = el.scrollWidth
      if (natural > available && next > 11) {
        next = next * (available / natural) * 0.96
        el.style.fontSize = `${Math.max(next, 11)}px`
      }
    }

    fit()

    const ro = new ResizeObserver(fit)
    ro.observe(el)
    if (el.parentElement) ro.observe(el.parentElement)

    // el tamaño general (Ajustes → Tamaño de letra) cambia un atributo en <html>,
    // lo cual no dispara ResizeObserver por sí solo
    const mo = new MutationObserver(fit)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-font-scale'] })

    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', fit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
