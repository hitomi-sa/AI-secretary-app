import { AssemblyAI } from 'assemblyai'

function getClient(): AssemblyAI {
  const apiKey = process.env.ASSEMBLYAI_API_KEY
  if (!apiKey) throw new Error('ASSEMBLYAI_API_KEY is not set')
  return new AssemblyAI({ apiKey })
}

export async function createTranscriptionJob(audioUrl: string): Promise<string> {
  const client = getClient()
  // submit() はジョブを作成して即返却（polling なし）
  // create() はデフォルトで poll:true のため完了まで待機してしまいタイムアウトする
  const transcript = await client.transcripts.submit({
    audio_url: audioUrl,
    speech_models: ['universal-2'],  // v3 API: speech_models (複数・配列) が必須
    language_code: 'ja',
  })
  return transcript.id
}

export async function getTranscriptionStatus(transcriptId: string): Promise<{
  status: 'queued' | 'processing' | 'completed' | 'error'
  text?: string
  error?: string
}> {
  const client = getClient()
  const result = await client.transcripts.get(transcriptId)

  if (result.status === 'completed') {
    return { status: 'completed', text: result.text ?? undefined }
  }
  if (result.status === 'error') {
    return { status: 'error', error: result.error ?? 'Unknown transcription error' }
  }
  if (result.status === 'processing') {
    return { status: 'processing' }
  }
  return { status: 'queued' }
}
