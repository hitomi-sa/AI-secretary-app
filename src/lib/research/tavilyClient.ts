import { tavily } from '@tavily/core'
import type { ResearchSource } from '@/types/research'

function getClient() {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) throw new Error('TAVILY_API_KEY is not set')
  return tavily({ apiKey })
}

export interface TavilySearchResult {
  answer: string | null
  sources: ResearchSource[]
}

export async function searchWeb(query: string): Promise<TavilySearchResult> {
  const client = getClient()

  const response = await client.search(query, {
    searchDepth: 'advanced',
    maxResults: 8,
    includeAnswer: true,
    includeRawContent: false,
  })

  const sources: ResearchSource[] = (response.results ?? []).map(r => ({
    title: r.title ?? '',
    url: r.url ?? '',
    content: r.content ?? '',
    score: r.score,
    publishedDate: r.publishedDate ?? undefined,
  }))

  return {
    answer: typeof response.answer === 'string' ? response.answer : null,
    sources,
  }
}
