// Utilidades de fecha en zona horaria local del dispositivo, formato YYYY-MM-DD (sin libs externas).

export function todayISO(): string {
  return toISO(new Date())
}

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, delta: number): string {
  const d = fromISO(iso)
  d.setDate(d.getDate() + delta)
  return toISO(d)
}

export function diffDays(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((fromISO(a).getTime() - fromISO(b).getTime()) / msPerDay)
}

export function isToday(iso: string): boolean {
  return iso === todayISO()
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const DIAS_CORTOS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatLongDate(iso: string): { weekday: string; day: number; month: string; year: number } {
  const d = fromISO(iso)
  return {
    weekday: DIAS[d.getDay()],
    day: d.getDate(),
    month: MESES[d.getMonth()],
    year: d.getFullYear()
  }
}

export function weekdayShort(iso: string): string {
  return DIAS_CORTOS[fromISO(iso).getDay()]
}

export function monthShort(iso: string): string {
  return MESES_CORTOS[fromISO(iso).getMonth()]
}

/** "HOY" / "AYER" / "MAÑANA" / "EN N DÍAS" / "HACE N DÍAS" / null si está muy lejos. */
export function relativeLabel(iso: string): string | null {
  const d = diffDays(iso, todayISO())
  if (d === 0) return 'HOY'
  if (d === 1) return 'MAÑANA'
  if (d === -1) return 'AYER'
  if (d > 1 && d <= 30) return `EN ${d} DÍAS`
  if (d < -1 && d >= -30) return `HACE ${-d} DÍAS`
  return null
}

export function monthLabel(year: number, month: number): string {
  return `${MESES[month]} ${year}`
}

/** Matriz de semanas (lun-dom) para el mes dado, con días del mes adyacente para completar la grilla. */
export function buildMonthGrid(year: number, month: number): { iso: string; inMonth: boolean }[] {
  const first = new Date(year, month, 1)
  // lunes=0 ... domingo=6
  const firstWeekday = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - firstWeekday)
  const days: { iso: string; inMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({ iso: toISO(d), inMonth: d.getMonth() === month })
  }
  return days
}

/** Lunes de la semana que contiene `iso`. */
export function startOfWeek(iso: string): string {
  const d = fromISO(iso)
  const weekday = (d.getDay() + 6) % 7 // lunes=0
  d.setDate(d.getDate() - weekday)
  return toISO(d)
}

/** Los 7 días (lun→dom) de la semana que contiene `iso`. */
export function weekDays(iso: string): string[] {
  const start = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** Número de semana ISO-8601 aproximado. */
export function isoWeekNumber(iso: string): number {
  const d = fromISO(iso)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

export function formatTime(time: string | null): string {
  if (!time) return ''
  return time.slice(0, 5)
}

export function nextWeekdayLabel(): { iso: string; label: string } {
  const iso = addDays(todayISO(), 2)
  const names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  return { iso, label: names[fromISO(iso).getDay()] }
}
