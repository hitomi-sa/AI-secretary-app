import { getOpenAIClient } from '@/lib/ai/openai'
import type { ActionItem } from '@/types/minutes'

export interface GeneratedMinutes {
  discussedTopics: string[]
  decisions: string[]
  nextActions: ActionItem[]
}

export async function generateMinutes(transcriptionText: string): Promise<GeneratedMinutes> {
  const openai = getOpenAIClient()

  const prompt = `以下の会議の文字起こしを議事録形式にまとめてください。
出力はJSON形式で:
{
  "discussedTopics": ["議題1", "議題2", ...],
  "decisions": ["決定事項1", ...],
  "nextActions": [{"task": "タスク", "assignee": "担当者", "dueDate": "YYYY-MM-DD"}, ...]
}

文字起こし:
${transcriptionText}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw) as GeneratedMinutes

  return {
    discussedTopics: parsed.discussedTopics ?? [],
    decisions: parsed.decisions ?? [],
    nextActions: parsed.nextActions ?? [],
  }
}
