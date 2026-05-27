import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteAudioFile } from '@/lib/storage/audioStorage'
import type { MinutesDocument, MinutesMetadata, ActionItem } from '@/types/minutes'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: doc, error } = await supabase
    .from('documents')
    .select('id, user_id, title, original_content, processed_content, metadata, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'minutes')
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const minutes: MinutesDocument = {
    id: doc.id,
    user_id: doc.user_id,
    title: doc.title,
    original_content: doc.original_content ?? '',
    processed_content: doc.processed_content ?? '',
    metadata: doc.metadata as unknown as MinutesMetadata,
    created_at: doc.created_at,
  }

  return NextResponse.json(minutes)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: {
    title?: string
    discussedTopics?: string[]
    decisions?: string[]
    nextActions?: ActionItem[]
  }
  try {
    body = await request.json()
  } catch (err) {
    console.error('JSON parse error:', err)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, user_id, title, original_content, processed_content, metadata, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'minutes')
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const currentMetadata = doc.metadata as unknown as MinutesMetadata
  const updatedMetadata: MinutesMetadata = {
    ...currentMetadata,
    ...(body.discussedTopics !== undefined && { discussedTopics: body.discussedTopics }),
    ...(body.decisions !== undefined && { decisions: body.decisions }),
    ...(body.nextActions !== undefined && { nextActions: body.nextActions }),
  }

  const updatePayload: Record<string, unknown> = {
    metadata: updatedMetadata as unknown as Record<string, unknown>,
  }
  if (body.title !== undefined) {
    updatePayload.title = body.title
  }

  const { data: updated, error: updateError } = await supabase
    .from('documents')
    .update(updatePayload)
    .eq('id', id)
    .select('id, user_id, title, original_content, processed_content, metadata, created_at')
    .single()

  if (updateError || !updated) {
    console.error('Document update error:', updateError)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }

  const minutes: MinutesDocument = {
    id: updated.id,
    user_id: updated.user_id,
    title: updated.title,
    original_content: updated.original_content ?? '',
    processed_content: updated.processed_content ?? '',
    metadata: updated.metadata as unknown as MinutesMetadata,
    created_at: updated.created_at,
  }

  return NextResponse.json(minutes)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, user_id, metadata')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'minutes')
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const metadata = doc.metadata as unknown as MinutesMetadata

  // Storageから音声ファイルを削除（失敗しても続行）
  if (metadata.audioFileUrl) {
    try {
      await deleteAudioFile(supabase, metadata.audioFileUrl)
    } catch (err) {
      console.error('Audio file deletion error:', err)
    }
  }

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Document deletion error:', deleteError)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
