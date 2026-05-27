import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGoogleEvent, refreshAccessToken } from '@/lib/calendar/googleCalendar'
import { toTokyoDateString } from '@/lib/utils'
import type { TaskInsert } from '@/types/database'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') ?? '50', 10)
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // link_calendar_event_id: カレンダーの「タスクとして保存」から呼ばれた場合に
  // 既存の calendar_events 行に task_id をリンクする（重複作成を防ぐ）
  const body = await request.json() as TaskInsert & { link_calendar_event_id?: string }
  const { link_calendar_event_id, ...taskBody } = body

  if (!taskBody.title?.trim()) {
    return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskBody, user_id: user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (link_calendar_event_id) {
    // カレンダーイベントが既に存在する場合: task_id を紐付けるだけ（重複作成しない）
    await supabase
      .from('calendar_events')
      .update({ task_id: data.id })
      .eq('id', link_calendar_event_id)
      .eq('user_id', user.id)
  } else if (data.due_date) {
    // タスク管理から作成した場合: calendar_events + Google Calendar に登録
    const isAllDay = data.is_all_day ?? false
    // 終日の場合のみ正午アンカーを使う。時刻指定の場合は実際の ISO を使う
    const startTime = isAllDay
      ? `${toTokyoDateString(data.start_date ?? data.due_date)}T12:00:00.000Z`
      : (data.start_date ?? data.due_date)
    const endTime = isAllDay
      ? `${toTokyoDateString(data.due_date)}T12:00:00.000Z`
      : data.due_date

    const { data: tokenRow } = await supabase
      .from('calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let googleEventId: string | null = null

    if (tokenRow) {
      try {
        let token = {
          access_token: tokenRow.access_token as string,
          refresh_token: tokenRow.refresh_token as string | null,
          expiry_date: tokenRow.expiry_date as number | null,
        }

        if (token.expiry_date && Date.now() > token.expiry_date) {
          token = await refreshAccessToken(token)
          await supabase
            .from('calendar_tokens')
            .update({ access_token: token.access_token, expiry_date: token.expiry_date })
            .eq('user_id', user.id)
        }

        const gEvent = await createGoogleEvent(token, {
          title: data.title,
          description: data.description ?? null,
          location: data.location ?? null,
          start_time: startTime,
          end_time: endTime,
          is_all_day: isAllDay,
          task_id: data.id,
          color: null,
        })
        googleEventId = gEvent.id ?? null
      } catch (err) {
        console.error('Google Calendar task sync error:', err)
      }
    }

    await supabase.from('calendar_events').insert({
      user_id: user.id,
      google_event_id: googleEventId,
      title: data.title,
      description: data.description ?? null,
      location: data.location ?? null,
      start_time: startTime,
      end_time: endTime,
      is_all_day: isAllDay,
      task_id: data.id,
      color: null,
      source: googleEventId ? 'google' : 'local',
    })
  }

  return NextResponse.json(data, { status: 201 })
}
