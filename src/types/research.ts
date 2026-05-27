export interface ResearchSource {
  title: string
  url: string
  content: string
  score?: number
  publishedDate?: string
}

export interface ResearchSummary {
  overview: string
  keyPoints: string[]
  details: string
  relatedTopics: string[]
}

export interface ResearchMetadata {
  query: string
  sources: ResearchSource[]
  searchDate: string
}

export interface ResearchDocument {
  id: string
  user_id: string
  title: string
  original_content: string   // Tavily生の結果JSON
  processed_content: string  // OpenAI要約JSON
  metadata: ResearchMetadata
  created_at: string
}
