import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/ai/openai'
import { buildProofreadPrompt } from '@/lib/ai/prompts'
import type { DocumentType, ProofreadResult } from '@/types/document'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { content: string; documentType: DocumentType }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { content, documentType = 'general' } = body
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: '校正するテキストを入力してください' }, { status: 400 })
  }
  if (content.length > 10000) {
    return NextResponse.json({ error: 'テキストは10,000文字以内で入力してください' }, { status: 400 })
  }

  const openai = getOpenAIClient()
  const prompt = buildProofreadPrompt(content, documentType)

  let result: ProofreadResult
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    result = JSON.parse(raw) as ProofreadResult
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json({ error: '校正処理に失敗しました' }, { status: 500 })
  }

  // 履歴をDBに保存（失敗してもレスポンスは返す）
  const title = content.slice(0, 50).replace(/\n/g, ' ') + (content.length > 50 ? '…' : '')
  await supabase.from('documents').insert({
    user_id:           user.id,
    type:              'proofread',
    title,
    original_content:  content,
    processed_content: result.corrected,
    metadata: {
      documentType,
      suggestions: result.suggestions ?? [],
      summary:     result.summary ?? '',
    },
  })

  return NextResponse.json(result)
}
