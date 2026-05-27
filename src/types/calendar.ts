export interface CalendarEvent {
  id: string
  user_id: string
  google_event_id: string | null
  title: string
  description: string | null
  location: string | null
  start_time: string  // ISO 8601
  end_time: string    // ISO 8601
  is_all_day: boolean
  task_id: string | null
  color: string | null
  source: 'google' | 'local'
  created_at: string
  updated_at: string
}

export interface CalendarToken {
  access_token: string
  refresh_token: string | null
  expiry_date: number | null
}

export interface CalendarEventInput {
  title: string
  description?: string | null
  location?: string | null
  start_time: string
  end_time: string
  is_all_day?: boolean
  task_id?: string | null
  color?: string | null
}

export type CalendarView = 'month' | 'week' | 'day'
