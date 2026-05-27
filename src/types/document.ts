export type DocumentType = 'email' | 'report' | 'proposal' | 'general'

export interface Suggestion {
  id: string
  type: 'spelling' | 'grammar' | 'style' | 'structure'
  original: string
  suggested: string
  explanation: string
}

export interface ProofreadResult {
  corrected: string
  suggestions: Suggestion[]
  summary: string
}

export interface ProofreadDocument {
  id: string
  user_id: string
  title: string
  original_content: string
  processed_content: string
  metadata: {
    documentType: DocumentType
    suggestions: Suggestion[]
    summary: string
  }
  created_at: string
}
