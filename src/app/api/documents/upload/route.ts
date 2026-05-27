import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadAudioFile } from '@/lib/storage/audioStorage'
import type { MinutesMetadata } from '@/types/minutes'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (err) {
    console.error('FormData parse error:', err)
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }

  const meetingTitle = (formData.get('meetingTitle') as string | null) ?? file.name

  // 1. documentsテーブルにレコード作成（IDを確定）
  const initialMetadata: MinutesMetadata = {
    audioFileUrl: '',
    transcriptionId: null,
    status: 'uploading',
    discussedTopics: [],
    decisions: [],
    nextActions: [],
  }

  const { data: doc, error: insertError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      type: 'minutes',
      title: meetingTitle,
      original_content: '',
      processed_content: '',
      metadata: initialMetadata as unknown as Record<string, unknown>,
    })
    .select('id')
    .single()

  if (insertError || !doc) {
    console.error('Document insert error:', insertError)
    return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
  }

  // 2. Storageにアップロード
  let storagePath: string
  try {
    storagePath = await uploadAudioFile(supabase, user.id, doc.id, file)
  } catch (err) {
    console.error('Storage upload error:', err)
    // 作成したレコードを削除
    await supabase.from('documents').delete().eq('id', doc.id)
    return NextResponse.json({ error: 'Failed to upload audio file' }, { status: 500 })
  }

  // 3. metadataのaudioFileUrlを更新
  const updatedMetadata: MinutesMetadata = {
    audioFileUrl: storagePath,
    transcriptionId: null,
    status: 'uploading',
    discussedTopics: [],
    decisions: [],
    nextActions: [],
  }

  const { error: updateError } = await supabase
    .from('documents')
    .update({ metadata: updatedMetadata as unknown as Record<string, unknown> })
    .eq('id', doc.id)

  if (updateError) {
    console.error('Document update error:', updateError)
    return NextResponse.json({ error: 'Failed to update document metadata' }, { status: 500 })
  }

  return NextResponse.json({ documentId: doc.id }, { status: 201 })
}
