import { createClient } from './client'
import type { Document, DocumentInsert, DocumentType } from '@/types/database'

export async function getDocuments(type?: DocumentType): Promise<Document[]> {
  const supabase = createClient()
  let query = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
  if (type) query = query.eq('type', type)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createDocument(doc: DocumentInsert): Promise<Document> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}
