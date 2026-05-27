import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateGoogleEvent, deleteGoogleEvent, refreshAccessToken } from '@/lib/calendar/googleCalendar'
import type { CalendarEventInput, CalendarToken } from '@/types/calendar'

type RouteContext = { params: Promise<{ id: string }> }

async function getTokenForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<CalendarToken | null> {
  const { data: tokenRow } = await supabase
    .from('calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!tokenRow) return null

  let token: CalendarToken = {
    access_token: tokenRow.access_token as string,
    refresh_token: tokenRow.refresh_token as string | null,
    expiry_date: tokenRow.expiry_date as number | null,
  }

  if (token.expiry_date && Date.now() > token.expiry_date) {
    try {
      token = await refreshAccessToken(token)
      await supabase
        .from('calendar_tokens')
        .update({ access_token: token.access_token, expiry_date: token.expiry_date })
        .eq('user_id', userId)
    } catch (err) {
      console.error('Token refresh error:', err)
      return null
    }
  }

  return token
}

/** PUT /api/calendar/events/[id] */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as CalendarEventInput
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
  }

  // 所有権確認
  const { data: existing, error: fetchError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 })
  }

  // Google側更新（google_event_id がある場合のみ）
  if (existing.google_event_id) {
    const token = await getTokenForUser(supabase, user.id)
    if (token) {
      try {
        await updateGoogleEvent(token, existing.google_event_id as string, body)
      } catch (err) {
        console.error('Google Calendar update error:', err)
      }
    }
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      title: body.title,
      description: body.description ?? null,
      location: body.location ?? null,
      start_time: body.start_time,
      end_time: body.end_time,
      is_all_day: body.is_all_day ?? false,
      task_id: body.task_id ?? null,
      color: body.color ?? null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

/** DELETE /api/calendar/events/[id] */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 所有権確認
  const { data: existing, error: fetchError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 })
  }

  // Google側削除（google_event_id がある場合のみ）
  if (existing.google_event_id) {
    const token = await getTokenForUser(supabase, user.id)
    if (token) {
      try {
        await deleteGoogleEvent(token, existing.google_event_id as string)
      } catch (err) {
        console.error('Google Calendar delete error:', err)
      }
    }
  }

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
