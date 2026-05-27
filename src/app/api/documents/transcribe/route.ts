import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSignedAudioUrl } from '@/lib/storage/audioStorage'
import { createTranscriptionJob } from '@/lib/transcription/assemblyai'
import type { MinutesMetadata } from '@/types/minutes'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { documentId: string }
  try {
    body = await request.json()
  } catch (err) {
    console.error('JSON parse error:', err)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { documentId } = body
  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
  }

  // 1. DBからdocumentを取得
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, user_id, metadata')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const metadata = doc.metadata as unknown as MinutesMetadata
  if (!metadata.audioFileUrl) {
    return NextResponse.json({ error: 'Audio file not found in document' }, { status: 400 })
  }

  // 2. Signed URL取得
  let signedUrl: string
  try {
    signedUrl = await getSignedAudioUrl(supabase, metadata.audioFileUrl)
  } catch (err) {
    console.error('Signed URL error:', err)
    return NextResponse.json({ error: 'Failed to get audio URL' }, { status: 500 })
  }

  // 3. AssemblyAIにジョブ作成
  let transcriptionId: string
  try {
    transcriptionId = await createTranscriptionJob(signedUrl)
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('AssemblyAI job creation error:', errMsg)
    return NextResponse.json({ error: `Failed to create transcription job: ${errMsg}` }, { status: 500 })
  }

  // 4. metadataを更新
  const updatedMetadata: MinutesMetadata = {
    ...metadata,
    transcriptionId,
    status: 'transcribing',
  }

  const { error: updateError } = await supabase
    .from('documents')
    .update({ metadata: updatedMetadata as unknown as Record<string, unknown> })
    .eq('id', documentId)

  if (updateError) {
    console.error('Document update error:', updateError)
    return NextResponse.json({ error: 'Failed to update document status' }, { status: 500 })
  }

  return NextResponse.json({ documentId, status: 'transcribing' })
}
