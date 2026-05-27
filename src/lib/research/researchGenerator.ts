import { getOpenAIClient } from '@/lib/ai/openai'
import type { ResearchSummary, ResearchSource } from '@/types/research'

export async function generateResearchSummary(
  query: string,
  tavilyAnswer: string | null,
  sources: ResearchSource[]
): Promise<ResearchSummary> {
  const openai = getOpenAIClient()

  const sourcesText = sources
    .slice(0, 6)
    .map((s, i) => `[${i + 1}] ${s.title}\n${s.content}`)
    .join('\n\n')

  const prompt = `あなたは優秀なリサーチアナリストです。以下の検索結果をもとに、ユーザーのリサーチクエリに対する構造化されたレポートを作成してください。

クエリ: ${query}

${tavilyAnswer ? `検索エンジンの回答:\n${tavilyAnswer}\n\n` : ''}参考情報:
${sourcesText}

以下のJSON形式で出力してください:
{
  "overview": "全体的な概要（200〜300文字）",
  "keyPoints": ["重要なポイント1", "重要なポイント2", "重要なポイント3", ...（最大5個）"],
  "details": "詳細な説明（500〜800文字）",
  "relatedTopics": ["関連トピック1", "関連トピック2", "関連トピック3"]
}`

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const raw = res.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw) as Partial<ResearchSummary>

  return {
    overview: parsed.overview ?? '',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    details: parsed.details ?? '',
    relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : [],
  }
}
