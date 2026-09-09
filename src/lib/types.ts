export type Priority = 1 | 2 | 3 // 1 alta, 2 media, 3 baja

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  user_id: string
  title: string
  time: string | null // 'HH:MM:SS' o null
  date: string // 'YYYY-MM-DD', día en el que vive hoy
  original_date: string
  done: boolean
  done_at: string | null
  carried_over: boolean
  priority: Priority | null
  category: string | null
  sort_order: number
  auto_rollover: boolean
  subtasks: Subtask[]
  created_at: string
  updated_at: string
}

export type NewTaskInput = {
  title: string
  time: string | null
  category: string | null
  priority: Priority | null
  subtasks: Subtask[]
  auto_rollover: boolean
}

export interface StatsSummary {
  streak: number
  same_day_pct: number
  stuck_count: number
  categories: { category: string; pct: number }[]
  day_stats: { dow: number; pct: number }[]
  bars: number[]
}
