import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGoogleEvent, refreshAccessToken } from '@/lib/calendar/googleCalendar'
import type { CalendarEventInput } from '@/types/calendar'

/** GET /api/calendar/events?start=ISO&end=ISO */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start と end クエリパラメータは必須です' }, { status: 400 })
  }

  // カレンダーイベント取得
  const { data: events, error: eventsError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', start)
    .lte('start_time', end)
    .order('start_time', { ascending: true })

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 })
  }

  return NextResponse.json({ events: events ?? [] })
}

/** POST /api/calendar/events */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as CalendarEventInput
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
  }
  if (!body.start_time || !body.end_time) {
    return NextResponse.json({ error: 'start_time と end_time は必須です' }, { status: 400 })
  }

  let googleEventId: string | null = null

  // Googleカレンダーにも作成（トークンが存在する場合のみ）
  const { data: tokenRow } = await supabase
    .from('calendar_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (tokenRow) {
    try {
      let token = {
        access_token: tokenRow.access_token as string,
        refresh_token: tokenRow.refresh_token as string | null,
        expiry_date: tokenRow.expiry_date as number | null,
      }

      // トークン期限切れなら更新
      if (token.expiry_date && Date.now() > token.expiry_date) {
        token = await refreshAccessToken(token)
        await supabase
          .from('calendar_tokens')
          .update({ access_token: token.access_token, expiry_date: token.expiry_date })
          .eq('user_id', user.id)
      }

      const gEvent = await createGoogleEvent(token, body)
      googleEventId = gEvent.id ?? null
    } catch (err) {
      console.error('Google Calendar create event error:', err)
      // Google側の失敗はローカル保存を妨げない
    }
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      google_event_id: googleEventId,
      title: body.title,
      description: body.description ?? null,
      location: body.location ?? null,
      start_time: body.start_time,
      end_time: body.end_time,
      is_all_day: body.is_all_day ?? false,
      task_id: body.task_id ?? null,
      color: body.color ?? null,
      source: googleEventId ? 'google' : 'local',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
