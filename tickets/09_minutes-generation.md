# Ticket #09: 議事録作成機能実装


## 概要
AssemblyAI APIを使用して音声ファイルから自動文字起こしを行い、OpenAI APIで議事録フォーマットに整形する機能を実装する。


## 目的
- 音声ファイルの文字起こし
- 議事録フォーマットでの自動生成
- 議事録の保存・管理


## 実装内容


### 1. 議事録作成ページ（src/app/dashboard/documents/minutes/page.tsx）
- 音声ファイルアップロード
- 処理状況表示
- 議事録一覧
- 新規作成ボタン


### 2. 議事録詳細ページ（src/app/dashboard/documents/minutes/[id]/page.tsx）
- 議事録表示
- 編集機能
- エクスポート機能
- 削除機能


### 3. 議事録関連コンポーネント


#### AudioUploader（src/components/documents/AudioUploader.tsx）
- ドラッグ&ドロップ対応
- ファイル形式検証（mp3, wav, m4a）
- ファイルサイズ表示（最大5GB）
- アップロード進捗表示
- キャンセル機能


#### TranscriptionProgress（src/components/documents/TranscriptionProgress.tsx）
- 処理ステップ表示：
 1. ファイルアップロード
 2. 音声認識処理
 3. テキスト生成
 4. 議事録フォーマット化
- 各ステップの進捗率
- 推定残り時間
- エラー表示


#### MinutesDisplay（src/components/documents/MinutesDisplay.tsx）
- 議事録表示
- セクション別表示：
 - 議論された内容
 - 決定事項
 - ネクストアクション
- 編集モード切替
- 自動保存機能


#### MinutesEditor（src/components/documents/MinutesEditor.tsx）
- 議事録編集エディター
- セクション別編集
- リアルタイムプレビュー
- 変更履歴管理


#### MinutesList（src/components/documents/MinutesList.tsx）
- 議事録一覧表示
- 日付でソート
- 検索機能
- フィルター（作成日、会議名）
- ページネーション


#### MinutesExporter（src/components/documents/MinutesExporter.tsx）
- エクスポート形式選択：
 - PDF
 - Word
 - Markdown
 - Plain Text
- ダウンロード機能


### 4. API Routes（src/app/api/documents/）


#### POST /api/documents/upload
```typescript
リクエスト:
{
 file: File
 meetingTitle?: string
 meetingDate?: Date
}


レスポンス:
{
 uploadId: string
 status: 'uploaded'
 fileSize: number
 estimatedTime: number
}
```


#### POST /api/documents/transcribe
```typescript
リクエスト:
{
 uploadId: string
}


レスポンス:
{
 transcriptionId: string
 status: 'processing' | 'completed' | 'failed'
 progress: number
}
```


#### GET /api/documents/transcribe/[id]/status
- 文字起こし処理状況取得
- ポーリング用エンドポイント


#### POST /api/documents/minutes
```typescript
リクエスト:
{
 transcriptionId: string
 transcriptionText: string
}


レスポンス:
{
 minutesId: string
 minutes: {
   discussedTopics: string[]
   decisions: string[]
   nextActions: string[]
 }
}
```


#### GET /api/documents/minutes
- 議事録一覧取得
- ページネーション対応


#### GET /api/documents/minutes/[id]
- 議事録詳細取得


#### PUT /api/documents/minutes/[id]
- 議事録更新


#### DELETE /api/documents/minutes/[id]
- 議事録削除


### 5. AssemblyAI統合（src/lib/transcription/）


#### assemblyai.ts
```typescript
- uploadAudio(file: File): Promise<string>
- createTranscription(audioUrl: string): Promise<string>
- getTranscriptionStatus(id: string): Promise<TranscriptionStatus>
- getTranscriptionText(id: string): Promise<string>
```


#### transcriptionQueue.ts
```typescript
- 非同期処理キュー管理
- リトライ機能
- エラーハンドリング
```


### 6. 議事録生成（src/lib/minutes/）


#### minutesGenerator.ts
```typescript
- generateMinutes(transcription: string): Promise<Minutes>
- formatMinutes(minutes: Minutes): string
- extractKeyPoints(text: string): string[]
```


#### minutesTemplates.ts
```typescript
- 議事録テンプレート定義
- フォーマットカスタマイズ
```


### 7. ファイルストレージ（src/lib/storage/）


#### audioStorage.ts
```typescript
- uploadToStorage(file: File): Promise<string>
- getSignedUrl(path: string): Promise<string>
- deleteFromStorage(path: string): Promise<void>
```


### 8. カスタムフック（src/hooks/documents/）


#### useAudioUpload.ts
```typescript
- ファイルアップロード管理
- 進捗追跡
- エラーハンドリング
```


#### useTranscription.ts
```typescript
- 文字起こし処理管理
- ステータスポーリング
- 結果取得
```


#### useMinutes.ts
```typescript
- 議事録CRUD操作
- 自動保存
- 編集管理
```


### 9. 型定義（src/types/minutes.ts）
```typescript
interface Minutes {
 id: string
 title: string
 meetingDate: Date
 audioFileUrl?: string
 transcription: string
 discussedTopics: string[]
 decisions: string[]
 nextActions: ActionItem[]
 createdAt: Date
 updatedAt: Date
}


interface ActionItem {
 task: string
 assignee?: string
 dueDate?: Date
}


interface TranscriptionJob {
 id: string
 status: 'pending' | 'processing' | 'completed' | 'failed'
 progress: number
 audioUrl: string
 result?: string
 error?: string
}
```


## 技術要件
- AssemblyAI API
- OpenAI API (GPT-4)
- ファイルストレージ（Supabase Storage）
- 非同期処理（ジョブキュー）
- WebSocket（進捗更新）


## 完了条件
- [x] 音声ファイルアップロード確認
- [ ] 文字起こし処理動作確認（AssemblyAI API v3対応修正中）
- [ ] 議事録自動生成確認（文字起こし完了後に確認予定）
- [x] 議事録編集・保存確認
- [x] エクスポート機能確認（txt / Markdown / PDF 実装済み）


## 注意事項
- 大容量ファイル対応（チャンク分割）
- 長時間処理のタイムアウト対策
- 処理失敗時のリトライ機能
- セキュリティ（ファイルアクセス制御）
