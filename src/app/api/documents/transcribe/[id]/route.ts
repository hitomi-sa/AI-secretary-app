import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranscriptionStatus } from '@/lib/transcription/assemblyai'
import { generateMinutes } from '@/lib/minutes/minutesGenerator'
import type { MinutesMetadata, MinutesStatus } from '@/types/minutes'

const PROGRESS_MAP: Record<MinutesStatus, number> = {
  uploading: 10,
  transcribing: 40,
  generating: 80,
  completed: 100,
  failed: 0,
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: documentId } = await params

  // 1. DBからdocumentを取得
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, user_id, original_content, metadata')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const metadata = doc.metadata as unknown as MinutesMetadata
  let currentStatus = metadata.status

  // 2. transcribing中はAssemblyAIのステータスを確認
  if (currentStatus === 'transcribing' && metadata.transcriptionId) {
    let transcriptionResult: Awaited<ReturnType<typeof getTranscriptionStatus>>
    try {
      transcriptionResult = await getTranscriptionStatus(metadata.transcriptionId)
    } catch (err) {
      console.error('AssemblyAI status check error:', err)
      return NextResponse.json({ status: currentStatus, progress: PROGRESS_MAP[currentStatus] })
    }

    if (transcriptionResult.status === 'completed' && transcriptionResult.text) {
      // OpenAIで議事録生成
      currentStatus = 'generating'
      await supabase
        .from('documents')
        .update({
          metadata: { ...metadata, status: 'generating' } as unknown as Record<string, unknown>,
        })
        .eq('id', documentId)

      try {
        const minutes = await generateMinutes(transcriptionResult.text)

        const completedMetadata: MinutesMetadata = {
          ...metadata,
          status: 'completed',
          discussedTopics: minutes.discussedTopics,
          decisions: minutes.decisions,
          nextActions: minutes.nextActions,
        }

        await supabase
          .from('documents')
          .update({
            original_content: transcriptionResult.text,
            processed_content: JSON.stringify(minutes),
            metadata: completedMetadata as unknown as Record<string, unknown>,
          })
          .eq('id', documentId)

        currentStatus = 'completed'
      } catch (err) {
        console.error('Minutes generation error:', err)
        const failedMetadata: MinutesMetadata = {
          ...metadata,
          status: 'failed',
          errorMessage: 'Failed to generate minutes',
        }
        await supabase
          .from('documents')
          .update({ metadata: failedMetadata as unknown as Record<string, unknown> })
          .eq('id', documentId)
        currentStatus = 'failed'
      }
    } else if (transcriptionResult.status === 'error') {
      const failedMetadata: MinutesMetadata = {
        ...metadata,
        status: 'failed',
        errorMessage: transcriptionResult.error ?? 'Transcription failed',
      }
      await supabase
        .from('documents')
        .update({ metadata: failedMetadata as unknown as Record<string, unknown> })
        .eq('id', documentId)
      currentStatus = 'failed'
    }
    // queued/processing は現状維持
  }

  return NextResponse.json({
    status: currentStatus,
    progress: PROGRESS_MAP[currentStatus],
  })
}
