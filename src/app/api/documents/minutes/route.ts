import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MinutesDocument, MinutesMetadata } from '@/types/minutes'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('documents')
    .select('id, user_id, title, original_content, processed_content, metadata, created_at')
    .eq('user_id', user.id)
    .eq('type', 'minutes')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch minutes' }, { status: 500 })
  }

  const minutes: MinutesDocument[] = (data ?? [])
    .filter((doc) => {
      const meta = doc.metadata as unknown as MinutesMetadata
      return meta.status === 'completed'
    })
    .map((doc) => ({
      id: doc.id,
      user_id: doc.user_id,
      title: doc.title,
      original_content: doc.original_content ?? '',
      processed_content: doc.processed_content ?? '',
      metadata: doc.metadata as unknown as MinutesMetadata,
      created_at: doc.created_at,
    }))

  return NextResponse.json({ minutes })
}
