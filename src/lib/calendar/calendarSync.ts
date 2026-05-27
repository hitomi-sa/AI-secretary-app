import type { SupabaseClient } from '@supabase/supabase-js'
import type { calendar_v3 } from 'googleapis'

/**
 * Googleカレンダーのイベント一覧をローカルの calendar_events テーブルに同期する。
 * - google_event_id が一致するレコードは upsert（task_id は保持）
 * - ローカルにあってGoogleに存在しないイベントは削除（タスク紐付きは除く）
 */
export async function syncGoogleToLocal(
  supabase: SupabaseClient,
  userId: string,
  googleEvents: calendar_v3.Schema$Event[],
  timeMin: string,
  timeMax: string,
): Promise<void> {
  const rows = googleEvents
    .filter((e) => e.status !== 'cancelled' && e.id)
    .map((e) => {
      const isAllDay = Boolean(e.start?.date && !e.start?.dateTime)
      // 終日イベント: T00:00:00Z だと JST で日付がずれるため正午アンカーを使用
      const startTime = e.start?.dateTime ?? `${e.start?.date}T12:00:00Z`
      const endTime   = e.end?.dateTime   ?? `${e.end?.date}T12:00:00Z`

      return {
        user_id: userId,
        google_event_id: e.id!,
        title: e.summary ?? '(タイトルなし)',
        description: e.description ?? null,
        location: e.location ?? null,
        start_time: startTime,
        end_time: endTime,
        is_all_day: isAllDay,
        task_id: null as string | null,   // 後でマージ
        color: e.colorId ?? null,
        source: 'google' as const,
      }
    })

  // ─── 既存行の task_id を保持 ──────────────────────────────────────────────────
  if (rows.length > 0) {
    const googleIds = rows.map((r) => r.google_event_id)
    const { data: existing } = await supabase
      .from('calendar_events')
      .select('google_event_id, task_id')
      .eq('user_id', userId)
      .in('google_event_id', googleIds)

    const taskIdMap = new Map<string, string | null>(
      (existing ?? []).map((e) => [e.google_event_id as string, e.task_id as string | null]),
    )

    for (const row of rows) {
      row.task_id = taskIdMap.get(row.google_event_id) ?? null
    }

    const { error } = await supabase
      .from('calendar_events')
      .upsert(rows, { onConflict: 'user_id,google_event_id' })

    if (error) {
      throw new Error(`syncGoogleToLocal upsert failed: ${error.message}`)
    }
  }

  // ─── Googleから消えたイベントをローカルからも削除 ────────────────────────────
  // 同期範囲内でローカルにある google-sourced イベントを取得
  const { data: localGoogleEvents } = await supabase
    .from('calendar_events')
    .select('id, google_event_id')
    .eq('user_id', userId)
    .eq('source', 'google')
    .is('task_id', null)          // タスク紐付きは残す
    .gte('start_time', timeMin)
    .lte('start_time', timeMax)

  if (localGoogleEvents && localGoogleEvents.length > 0) {
    const liveIds = new Set(rows.map((r) => r.google_event_id))
    const toDelete = localGoogleEvents
      .filter((e) => e.google_event_id && !liveIds.has(e.google_event_id as string))
      .map((e) => e.id as string)

    if (toDelete.length > 0) {
      await supabase.from('calendar_events').delete().in('id', toDelete)
    }
  }
}
