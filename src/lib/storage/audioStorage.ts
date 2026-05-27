import type { SupabaseClient } from '@supabase/supabase-js'

function sanitizeFilename(name: string): string {
  const ext = name.includes('.') ? '.' + name.split('.').pop()!.toLowerCase() : ''
  // 英数字・ハイフン・アンダースコア以外を除去してASCII安全なファイル名にする
  const base = name
    .replace(/\.[^.]+$/, '')          // 拡張子除去
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // 非ASCII文字を _に変換
    .slice(0, 60)                      // 最大60文字
  return (base || 'audio') + ext
}

export async function uploadAudioFile(
  supabase: SupabaseClient,
  userId: string,
  documentId: string,
  file: File
): Promise<string> {
  const safeFilename = sanitizeFilename(file.name)
  const path = `${userId}/${documentId}/${safeFilename}`
  const { error } = await supabase.storage
    .from('audio-files')
    .upload(path, file, { contentType: file.type || 'audio/mpeg' })
  if (error) throw new Error(`Audio upload failed: ${error.message}`)
  return path
}

export async function getSignedAudioUrl(
  supabase: SupabaseClient,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('audio-files')
    .createSignedUrl(path, 3600)
  if (error || !data?.signedUrl) {
    throw new Error(`Failed to get signed URL: ${error?.message ?? 'No URL returned'}`)
  }
  return data.signedUrl
}

export async function deleteAudioFile(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from('audio-files').remove([path])
  if (error) throw new Error(`Failed to delete audio file: ${error.message}`)
}
