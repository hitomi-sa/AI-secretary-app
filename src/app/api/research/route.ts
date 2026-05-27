import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { researchWithPerplexity } from '@/lib/research/perplexityClient'
import type { ResearchMetadata } from '@/types/research'

// POST /api/research — リサーチ実行
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { query: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { query } = body
  if (!query?.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  // 1. Perplexity で検索＋要約を一括実行
  let result: Awaited<ReturnType<typeof researchWithPerplexity>>
  try {
    result = await researchWithPerplexity(query.trim())
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Perplexity research error:', msg)
    return NextResponse.json({ error: `Research failed: ${msg}` }, { status: 500 })
  }

  // 2. DBに保存
  const metadata: ResearchMetadata = {
    query: query.trim(),
    sources: result.sources,
    searchDate: new Date().toISOString(),
  }

  const { data: doc, error: insertError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      type: 'research',
      title: query.trim().slice(0, 100),
      original_content: '',
      processed_content: JSON.stringify(result.summary),
      metadata: metadata as unknown as Record<string, unknown>,
    })
    .select('id')
    .single()

  if (insertError || !doc) {
    console.error('DB insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save research' }, { status: 500 })
  }

  return NextResponse.json({ id: doc.id, summary: result.summary, sources: result.sources })
}

// GET /api/research — 履歴一覧
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, metadata, created_at')
    .eq('user_id', user.id)
    .eq('type', 'research')
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
