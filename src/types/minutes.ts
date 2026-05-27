export type MinutesStatus = 'uploading' | 'transcribing' | 'generating' | 'completed' | 'failed'

export interface ActionItem {
  task: string
  assignee?: string
  dueDate?: string
}

export interface MinutesMetadata {
  audioFileUrl: string
  transcriptionId: string | null
  status: MinutesStatus
  errorMessage?: string
  discussedTopics: string[]
  decisions: string[]
  nextActions: ActionItem[]
}

export interface MinutesDocument {
  id: string
  user_id: string
  title: string
  original_content: string
  processed_content: string
  metadata: MinutesMetadata
  created_at: string
}
