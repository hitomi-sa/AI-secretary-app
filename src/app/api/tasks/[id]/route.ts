import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
  refreshAccessToken,
} from '@/lib/calendar/googleCalendar'
import { toTokyoDateString } from '@/lib/utils'
import type { TaskUpdate } from '@/types/database'

type RouteContext = { params: Promise<{ id: string }> }

// ─── トークン取得＆期限切れ更新 ──────────────────────────────────────────────

async function getValidToken(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: tokenRow } = await supabase
    .from('calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!tokenRow) return null

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
      .eq('user_id', userId)
  }

  return token
}

// ─── PUT /api/tasks/[id] ─────────────────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as TaskUpdate

  const { data, error } = await supabase
    .from('tasks')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // calendar_events の同期
  try {
    const { data: calEvent } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('task_id', id)
      .single()

    if (data.due_date) {
      const isAllDay = data.is_all_day ?? false
      const startTime = isAllDay
        ? `${toTokyoDateString(data.start_date ?? data.due_date)}T12:00:00.000Z`
        : (data.start_date ?? data.due_date)
      const endTime = isAllDay
        ? `${toTokyoDateString(data.due_date)}T12:00:00.000Z`
        : data.due_date
      const eventPayload = {
        title: data.title,
        description: data.description ?? null,
        location: data.location ?? null,
        start_time: startTime,
        end_time: endTime,
        is_all_day: isAllDay,
        task_id: data.id,
        color: null,
      }

      if (calEvent) {
        // 既存イベントを更新
        const token = await getValidToken(supabase, user.id)

        if (token && calEvent.google_event_id) {
          try {
            await updateGoogleEvent(token, calEvent.google_event_id as string, eventPayload)
          } catch (err) {
            console.error('Google Calendar task update error:', err)
          }
        } else if (token && !calEvent.google_event_id) {
          try {
            const gEvent = await createGoogleEvent(token, eventPayload)
            await supabase
              .from('calendar_events')
              .update({ google_event_id: gEvent.id ?? null, source: 'google' })
              .eq('task_id', id)
          } catch (err) {
            console.error('Google Calendar task create (on update) error:', err)
          }
        }

        await supabase
          .from('calendar_events')
          .update({
            title: data.title,
            description: data.description ?? null,
            location: data.location ?? null,
            start_time: startTime,
            end_time: endTime,
          })
          .eq('task_id', id)
      } else {
        // calendar_events 行がない → 新規作成
        const token = await getValidToken(supabase, user.id)
        let googleEventId: string | null = null

        if (token) {
          try {
            const gEvent = await createGoogleEvent(token, eventPayload)
            googleEventId = gEvent.id ?? null
          } catch (err) {
            console.error('Google Calendar task create error:', err)
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
    } else if (calEvent) {
      // due_date が削除された → calendar_events & Google も削除
      const token = await getValidToken(supabase, user.id)
      if (token && calEvent.google_event_id) {
        try {
          await deleteGoogleEvent(token, calEvent.google_event_id as string)
        } catch (err) {
          console.error('Google Calendar task delete (on due_date clear) error:', err)
        }
      }
      await supabase.from('calendar_events').delete().eq('task_id', id)
    }
  } catch (err) {
    console.error('calendar_events sync error on task update:', err)
  }

  return NextResponse.json(data)
}

// ─── DELETE /api/tasks/[id] ───────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // タスク削除前に calendar_events を確認して Google 側も削除
  try {
    const { data: calEvent } = await supabase
      .from('calendar_events')
      .select('google_event_id')
      .eq('task_id', id)
      .single()

    if (calEvent?.google_event_id) {
      const token = await getValidToken(supabase, user.id)
      if (token) {
        try {
          await deleteGoogleEvent(token, calEvent.google_event_id as string)
        } catch (err) {
          console.error('Google Calendar task delete error:', err)
        }
      }
    }

    // calendar_events 行を明示的に削除（ON DELETE SET NULL で残るため）
    await supabase.from('calendar_events').delete().eq('task_id', id)
  } catch (err) {
    console.error('calendar_events cleanup error on task delete:', err)
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
