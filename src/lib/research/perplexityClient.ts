import OpenAI from 'openai'
import type { ResearchSummary, ResearchSource } from '@/types/research'

// URL からドメイン＋パス末尾を取り出して可読なラベルを生成
function urlToLabel(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    const last = u.pathname.split('/').filter(Boolean).pop()
    const path = last ? last.replace(/[-_]/g, ' ').replace(/\.\w+$/, '') : ''
    return path ? `${host} — ${path}` : host
  } catch {
    return url
  }
}

// Perplexity API は OpenAI 互換フォーマット
function getClient(): OpenAI {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY is not set')
  return new OpenAI({ apiKey, baseURL: 'https://api.perplexity.ai' })
}

export interface PerplexitySearchResult {
  summary: ResearchSummary
  sources: ResearchSource[]
}

export async function researchWithPerplexity(query: string): Promise<PerplexitySearchResult> {
  const client = getClient()

  const systemPrompt = `あなたは優秀なリサーチアナリストです。ユーザーのリサーチクエリに対して、Webから収集した最新情報をもとに以下のJSON形式で回答してください。

{
  "overview": "全体的な概要（200〜300文字）",
  "keyPoints": ["重要なポイント1", "重要なポイント2", "重要なポイント3", "重要なポイント4", "重要なポイント5"],
  "details": "詳細な説明（500〜800文字）",
  "relatedTopics": ["関連トピック1", "関連トピック2", "関連トピック3"],
  "sourceDescriptions": [
    { "title": "参照した記事のタイトル", "excerpt": "記事の要点を1〜2文で説明" }
  ]
}

sourceDescriptions には参照した出典の数だけエントリを含め、引用順に並べること。
必ずJSON形式のみで出力し、前後に余分なテキストを含めないこと。`

  // Perplexity のレスポンスは citations フィールドを持つ（OpenAI 標準外）
  const response = await client.chat.completions.create({
    model: 'sonar-pro',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ],
    temperature: 0.2,
  }) as OpenAI.Chat.Completions.ChatCompletion & { citations?: string[] }

  // JSON パース
  const content = response.choices[0]?.message?.content ?? '{}'
  let parsed: Partial<ResearchSummary> & {
    sourceDescriptions?: { title: string; excerpt: string }[]
  }
  try {
    const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    parsed = { overview: content, keyPoints: [], details: '', relatedTopics: [] }
  }

  const summary: ResearchSummary = {
    overview: parsed.overview ?? '',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    details: parsed.details ?? '',
    relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : [],
  }

  // citations（URL）と sourceDescriptions（タイトル・要約）を結合
  const citations = response.citations ?? []
  const sourceDescs = Array.isArray(parsed.sourceDescriptions) ? parsed.sourceDescriptions : []

  const sources: ResearchSource[] = citations.map((url, i) => ({
    title: sourceDescs[i]?.title ?? urlToLabel(url),
    url,
    content: sourceDescs[i]?.excerpt ?? '',
  }))

  return { summary, sources }
}
