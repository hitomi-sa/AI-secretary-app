import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listGoogleEvents, refreshAccessToken } from '@/lib/calendar/googleCalendar'
import { syncGoogleToLocal } from '@/lib/calendar/calendarSync'
import type { CalendarToken } from '@/types/calendar'

/** POST /api/calendar/sync */
export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tokenRow } = await supabase
    .from('calendar_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tokenRow) {
    return NextResponse.json({ error: 'Googleカレンダーが未連携です' }, { status: 400 })
  }

  let token: CalendarToken = {
    access_token: tokenRow.access_token as string,
    refresh_token: tokenRow.refresh_token as string | null,
    expiry_date: tokenRow.expiry_date as number | null,
  }

  // トークン期限切れなら更新
  if (token.expiry_date && Date.now() > token.expiry_date) {
    try {
      token = await refreshAccessToken(token)
      await supabase
        .from('calendar_tokens')
        .update({ access_token: token.access_token, expiry_date: token.expiry_date })
        .eq('user_id', user.id)
    } catch (err) {
      console.error('Token refresh error:', err)
      return NextResponse.json({ error: 'トークンのリフレッシュに失敗しました' }, { status: 401 })
    }
  }

  // 直近3ヶ月分を取得
  const now = new Date()
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 3, 0, 23, 59, 59).toISOString()

  try {
    const googleEvents = await listGoogleEvents(token, timeMin, timeMax)
    await syncGoogleToLocal(supabase, user.id, googleEvents, timeMin, timeMax)
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Googleカレンダーの同期に失敗しました' }, { status: 500 })
  }

  // ─── タスク未連携の Google イベントに対してタスクを自動作成 ──────────────────
  try {
    const { data: unlinkedEvents } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('source', 'google')
      .is('task_id', null)

    if (unlinkedEvents && unlinkedEvents.length > 0) {
      for (const event of unlinkedEvents) {
        const { data: newTask } = await supabase
          .from('tasks')
          .insert({
            user_id:     user.id,
            title:       event.title as string,
            description: event.description as string | null ?? null,
            location:    event.location   as string | null ?? null,
            priority:    'medium',
            start_date:  event.start_time as string,
            due_date:    event.end_time   as string,
            is_all_day:  event.is_all_day as boolean,
            status:      'pending',
          })
          .select()
          .single()

        if (newTask) {
          await supabase
            .from('calendar_events')
            .update({ task_id: newTask.id })
            .eq('id', event.id as string)
        }
      }
    }
  } catch (err) {
    console.error('Auto task creation error:', err)
    // タスク作成失敗はサイレントスキップ（sync自体は成功扱い）
  }

  const lastSynced = new Date().toISOString()

  return NextResponse.json({ success: true, last_synced: lastSynced })
}
