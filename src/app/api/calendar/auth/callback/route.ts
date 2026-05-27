import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTokenFromCode } from '@/lib/calendar/googleCalendar'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(`${origin}/dashboard/calendar?error=missing_params`)
  }

  try {
    const token = await getTokenFromCode(code)

    const supabase = await createClient()

    // stateのuserIdが実際の認証ユーザーと一致するか確認
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.redirect(`${origin}/dashboard/calendar?error=unauthorized`)
    }

    const { error } = await supabase
      .from('calendar_tokens')
      .upsert(
        {
          user_id: userId,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expiry_date: token.expiry_date,
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('calendar_tokens upsert error:', error)
      return NextResponse.redirect(`${origin}/dashboard/calendar?error=token_save_failed`)
    }

    return NextResponse.redirect(`${origin}/dashboard/calendar?connected=true`)
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(`${origin}/dashboard/calendar?error=oauth_failed`)
  }
}
