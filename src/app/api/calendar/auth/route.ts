import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUrl } from '@/lib/calendar/googleCalendar'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/login`)
  }

  const url = getAuthUrl(user.id)
  return NextResponse.json({ url })
}
