# Ticket #08: 文章校正機能実装


## 概要
OpenAI APIを使用してAIによる文章校正機能を実装し、ユーザーの文体を学習・適用する機能を構築する。


## 目的
- AI文章校正機能の実装
- ユーザー文体の学習・分析
- パーソナライズされた校正提案


## 実装内容


### 1. 文章校正ページ（src/app/dashboard/documents/proofread/page.tsx）
- テキストエディター表示
- 校正実行ボタン
- 校正結果表示エリア
- 履歴一覧


### 2. 文章校正関連コンポーネント


#### DocumentEditor（src/components/documents/DocumentEditor.tsx）
- リッチテキストエディター
- 文字数カウンター
- 下書き保存機能
- クリアボタン
- テンプレート選択（メール、報告書など）


#### ProofreadPanel（src/components/documents/ProofreadPanel.tsx）
- 校正前/後の比較表示
- 変更箇所のハイライト
- 提案の受け入れ/却下
- 一括適用ボタン


#### ProofreadResult（src/components/documents/ProofreadResult.tsx）
- 校正結果表示
- カテゴリ別提案：
 - 誤字脱字
 - 文法修正
 - 文体改善
 - 構成提案
- 各提案の説明表示


#### WritingStyleAnalyzer（src/components/documents/WritingStyleAnalyzer.tsx）
- 文体分析結果表示
- 学習進度表示
- 文体特徴の可視化
- サンプル数表示


#### ProofreadHistory（src/components/documents/ProofreadHistory.tsx）
- 校正履歴一覧
- 日付でソート
- 検索機能
- 履歴から再編集


#### DocumentTypeSelector（src/components/documents/DocumentTypeSelector.tsx）
- 文書タイプ選択
- メール、報告書、提案書など
- タイプ別校正ルール適用


### 3. API Routes（src/app/api/documents/）


#### POST /api/documents/proofread
```typescript
リクエスト:
{
 content: string
 documentType: 'email' | 'report' | 'proposal' | 'general'
 applyUserStyle: boolean
}


レスポンス:
{
 original: string
 corrected: string
 suggestions: Suggestion[]
 writingStyleMatch: number // 文体一致度
}
```


#### POST /api/documents/writing-style/analyze
- ユーザーの文体分析
- パターン抽出
- データベース保存


#### GET /api/documents/writing-style
- ユーザー文体情報取得
- 学習済みパターン


#### GET /api/documents/proofread/history
- 校正履歴取得
- ページネーション対応


### 4. OpenAI統合（src/lib/ai/）


#### openai.ts
```typescript
- initializeOpenAI()
- proofreadText()
- analyzeWritingStyle()
- generateSuggestions()
```


#### prompts.ts
```typescript
- 校正用プロンプトテンプレート
- 文体分析プロンプト
- 文書タイプ別プロンプト
```


### 5. 文体学習システム（src/lib/writing-style/）


#### styleAnalyzer.ts
```typescript
interface WritingStyle {
 vocabulary: string[]
 sentencePatterns: Pattern[]
 formalityLevel: number
 averageSentenceLength: number
 commonPhrases: string[]
}


- analyzeStyle(text: string): WritingStyle
- compareStyles(style1: WritingStyle, style2: WritingStyle): number
- mergeStyles(existing: WritingStyle, new: WritingStyle): WritingStyle
```


#### styleApplicator.ts
```typescript
- applyUserStyle(text: string, userStyle: WritingStyle): string
- adaptSuggestions(suggestions: Suggestion[], userStyle: WritingStyle): Suggestion[]
```


### 6. カスタムフック（src/hooks/documents/）


#### useProofread.ts
```typescript
- 校正実行
- 結果取得
- エラーハンドリング
```


#### useWritingStyle.ts
```typescript
- 文体情報取得
- 文体更新
- 学習進度管理
```


#### useProofreadHistory.ts
```typescript
- 履歴取得
- 履歴検索
- 履歴からの復元
```


### 7. 型定義（src/types/document.ts）
```typescript
interface ProofreadRequest {
 content: string
 documentType: DocumentType
 applyUserStyle: boolean
}


interface Suggestion {
 id: string
 type: 'spelling' | 'grammar' | 'style' | 'structure'
 original: string
 suggested: string
 explanation: string
 position: { start: number; end: number }
 confidence: number
}


interface ProofreadResult {
 documentId: string
 original: string
 corrected: string
 suggestions: Suggestion[]
 writingStyleMatch: number
 createdAt: Date
}
```


## 技術要件
- OpenAI API (GPT-4)
- リッチテキストエディター
- 差分表示アルゴリズム
- 文体分析アルゴリズム


## 完了条件
- [x] 文章校正機能動作確認
- [x] 誤字脱字・文法チェック確認
- [ ] 文体学習機能動作確認（スキップ：ROI低・未実装）
- [x] 校正履歴保存確認
- [ ] パーソナライズ校正確認（スキップ：ROI低・未実装）


## 注意事項
- APIコール数の最適化
- 長文対応（分割処理）
- プライバシー配慮（文書の暗号化）
- レスポンス時間の最適化
