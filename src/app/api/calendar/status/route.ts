import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/calendar/status */
export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tokenRow } = await supabase
    .from('calendar_tokens')
    .select('updated_at')
    .eq('user_id', user.id)
    .single()

  if (!tokenRow) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected: true,
    last_synced: tokenRow.updated_at as string,
  })
}
