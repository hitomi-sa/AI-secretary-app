# Ticket #10: リサーチ機能実装


## 概要
OpenAI APIでリサーチ用プロンプトを最適化し、Perplexity APIで実際の検索を実行してユーザーに要約された情報を提供する機能を実装する。


## 目的
- AIによるリサーチプロンプト最適化
- Web検索と情報収集の自動化
- 検索結果の要約と出典管理


## 実装内容


### 1. リサーチページ（src/app/dashboard/documents/research/page.tsx）
- リサーチクエリ入力
- リサーチ実行ボタン
- 結果表示エリア
- リサーチ履歴


### 2. リサーチ詳細ページ（src/app/dashboard/documents/research/[id]/page.tsx）
- リサーチ結果詳細表示
- 出典リンク一覧
- 関連リサーチ提案
- 結果のエクスポート


### 3. リサーチ関連コンポーネント


#### ResearchInput（src/components/research/ResearchInput.tsx）
- テーマ入力フィールド
- プレースホルダー例表示
- 検索オプション：
 - 最新情報優先
 - トレンド情報
 - 学術情報
 - ニュース
- サジェスト機能


#### ResearchProgress（src/components/research/ResearchProgress.tsx）
- 処理ステップ表示：
 1. プロンプト最適化
 2. 検索実行
 3. 情報収集
 4. 要約生成
- アニメーション表示
- キャンセルボタン


#### ResearchResult（src/components/research/ResearchResult.tsx）
- 要約結果表示
- セクション別整理：
 - 概要
 - 主要ポイント
 - 詳細情報
 - 関連トピック
- 重要度ハイライト


#### SourcesList（src/components/research/SourcesList.tsx）
- 出典一覧表示
- 各出典情報：
 - タイトル
 - URL
 - 公開日
 - 信頼度スコア
 - 抜粋
- 外部リンクアイコン


#### ResearchHistory（src/components/research/ResearchHistory.tsx）
- 過去のリサーチ一覧
- 検索・フィルター機能
- お気に入り機能
- 削除機能


#### RelatedTopics（src/components/research/RelatedTopics.tsx）
- 関連トピック提案
- ワンクリックで追加検索
- トピックのトレンド表示


#### ResearchExporter（src/components/research/ResearchExporter.tsx）
- エクスポート形式選択：
 - PDF（レポート形式）
 - Markdown
 - JSON（構造化データ）
- 出典情報を含む/含まない選択


### 4. API Routes（src/app/api/research/）


#### POST /api/research
```typescript
リクエスト:
{
 query: string
 searchType: 'latest' | 'trends' | 'academic' | 'news' | 'general'
 maxResults?: number
}


レスポンス:
{
 researchId: string
 optimizedQuery: string
 summary: {
   overview: string
   keyPoints: string[]
   details: string
   relatedTopics: string[]
 }
 sources: Source[]
 metadata: {
   searchDate: Date
   resultsCount: number
   confidence: number
 }
}
```


#### GET /api/research
- リサーチ履歴取得
- フィルター対応
- ページネーション


#### GET /api/research/[id]
- リサーチ詳細取得
- 関連リサーチ含む


#### DELETE /api/research/[id]
- リサーチ削除


#### POST /api/research/prompt-optimize
```typescript
リクエスト:
{
 userQuery: string
 searchType: string
}


レスポンス:
{
 optimizedPrompt: string
 searchKeywords: string[]
 suggestedFilters: string[]
}
```


### 5. AI統合（src/lib/research/）


#### promptOptimizer.ts
```typescript
- optimizeSearchPrompt(query: string): Promise<OptimizedPrompt>
- extractKeywords(query: string): string[]
- generateSearchStrategy(query: string): SearchStrategy
```


#### perplexityClient.ts
```typescript
- search(query: string, options: SearchOptions): Promise<SearchResults>
- getRelatedTopics(query: string): Promise<string[]>
- validateSources(sources: Source[]): Source[]
```


#### summarizer.ts
```typescript
- summarizeResults(results: SearchResults): Promise<Summary>
- extractKeyPoints(text: string): string[]
- generateOverview(results: SearchResults): string
```


### 6. リサーチ戦略（src/lib/research/strategies/）


#### latestInfoStrategy.ts
- 最新情報収集戦略
- 日付フィルター適用
- ニュースソース優先


#### trendsStrategy.ts
- トレンド情報収集戦略
- ソーシャルシグナル考慮
- バイラル性分析


#### academicStrategy.ts
- 学術情報収集戦略
- 論文データベース優先
- 引用数考慮


### 7. カスタムフック（src/hooks/research/）


#### useResearch.ts
```typescript
- リサーチ実行管理
- 結果取得
- エラーハンドリング
```


#### useResearchHistory.ts
```typescript
- 履歴管理
- お気に入り機能
- 検索機能
```


#### useSourceValidation.ts
```typescript
- ソース信頼性検証
- 重複削除
- ランキング
```


### 8. 型定義（src/types/research.ts）
```typescript
interface ResearchRequest {
 query: string
 searchType: SearchType
 maxResults?: number
}


interface ResearchResult {
 id: string
 query: string
 optimizedQuery: string
 summary: ResearchSummary
 sources: Source[]
 metadata: ResearchMetadata
 createdAt: Date
}


interface ResearchSummary {
 overview: string
 keyPoints: string[]
 details: string
 relatedTopics: string[]
}


interface Source {
 title: string
 url: string
 excerpt: string
 publishedDate?: Date
 author?: string
 credibilityScore: number
 relevanceScore: number
}


interface SearchStrategy {
 keywords: string[]
 filters: SearchFilter[]
 prioritySources: string[]
 maxAge?: number
}
```


## 技術要件
- OpenAI API (GPT-4)
- Perplexity API
- 非同期処理
- キャッシュ戦略


## 完了条件
- [x] プロンプト最適化動作確認（Perplexity sonar-pro がシステムプロンプトで構造化出力）
- [x] Perplexity検索動作確認
- [x] 要約生成確認（概要・重要ポイント・詳細・関連トピック）
- [x] 出典管理機能確認（タイトル・URL・要約テキスト表示）
- [x] リサーチ履歴機能確認（一覧・選択・削除）


## 注意事項
- API利用制限の管理
- 検索結果のキャッシュ
- ソース信頼性の検証
- 著作権への配慮
