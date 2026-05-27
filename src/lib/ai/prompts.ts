import type { DocumentType } from '@/types/document'

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  email:    'ビジネスメール',
  report:   '報告書・レポート',
  proposal: '提案書・企画書',
  general:  '一般文書',
}

export function buildProofreadPrompt(content: string, documentType: DocumentType): string {
  const typeLabel = DOCUMENT_TYPE_LABELS[documentType]

  return `あなたは日本語の文章校正の専門家です。以下の${typeLabel}を校正してください。

【指示】
1. 誤字・脱字を修正する
2. 文法的な誤りを修正する
3. ${typeLabel}として不適切な表現を改善する
4. 読みやすさを向上させる

【出力形式】
必ず以下のJSON形式のみで返してください。説明や前置きは不要です。

{
  "corrected": "校正後の全文をここに記載",
  "summary": "全体的な校正内容の1〜2文の要約",
  "suggestions": [
    {
      "id": "1",
      "type": "spelling | grammar | style | structure のいずれか",
      "original": "修正前の該当箇所（文字列）",
      "suggested": "修正後の文字列",
      "explanation": "修正理由の簡潔な説明"
    }
  ]
}

typeの分類：
- spelling: 誤字・脱字
- grammar: 文法の誤り
- style: 文体・表現の改善
- structure: 文章構成の改善

【校正対象】
${content}`
}
