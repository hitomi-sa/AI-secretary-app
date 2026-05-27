# Ticket #06: タスク管理機能実装


## 概要
Todoリスト形式のタスク管理機能を実装し、優先度設定、期限管理、アラート通知機能を構築する。


## 目的
- タスクのCRUD操作機能の実装
- 優先度と期限による管理機能
- 2日前アラート通知システム


## 実装内容


### 1. タスク管理ページ（src/app/dashboard/tasks/page.tsx）
- タスク一覧表示
- フィルター機能（状態、優先度、期限）
- ソート機能
- タスク追加ボタン


### 2. タスク関連コンポーネント


#### TaskList（src/components/tasks/TaskList.tsx）
- タスク一覧表示
- グループ化表示（優先度別、期限別）
- 完了/未完了の切り替え
- ページネーション


#### TaskItem（src/components/tasks/TaskItem.tsx）
- タスク個別表示
- チェックボックスで完了状態切り替え
- 優先度バッジ表示
- 期限表示（残り時間）
- 編集・削除ボタン


#### TaskForm（src/components/tasks/TaskForm.tsx）
- タスク作成/編集フォーム
- フィールド：
 - タイトル（必須）
 - 説明
 - 優先度選択（高・中・低）
 - 期限日時選択（カレンダーUI）
- バリデーション
- 保存/キャンセルボタン


#### TaskFilter（src/components/tasks/TaskFilter.tsx）
- ステータスフィルター（全て/未完了/完了）
- 優先度フィルター
- 期限フィルター（今日/今週/今月/期限切れ）
- クリアボタン


#### TaskAlertBanner（src/components/tasks/TaskAlertBanner.tsx）
- 期限2日前のタスク通知表示
- アラートタスク数表示
- クリックで該当タスクへスクロール


### 3. API Routes（src/app/api/tasks/）


#### GET /api/tasks
- タスク一覧取得
- クエリパラメータ：status, priority, due_date
- ページネーション対応


#### POST /api/tasks
- タスク作成
- バリデーション
- ユーザーIDの自動設定


#### PUT /api/tasks/[id]
- タスク更新
- 部分更新対応
- 権限チェック


#### DELETE /api/tasks/[id]
- タスク削除
- 権限チェック


#### GET /api/tasks/alerts
- アラート対象タスク取得
- 期限2日前のタスクを抽出


### 4. カスタムフック（src/hooks/tasks/）


#### useTask.ts
```typescript
- 単一タスク取得
- 更新・削除機能
```


#### useTasks.ts
```typescript
- タスク一覧取得
- フィルター・ソート
- リアルタイム更新
```


#### useTaskAlerts.ts
```typescript
- アラート対象タスク取得
- 通知管理
```


### 5. タスク管理Context（src/contexts/TaskContext.tsx）
```typescript
interface TaskContextType {
 tasks: Task[]
 isLoading: boolean
 filters: TaskFilters
 setFilters: (filters: TaskFilters) => void
 createTask: (task: TaskInput) => Promise<void>
 updateTask: (id: string, task: TaskInput) => Promise<void>
 deleteTask: (id: string) => Promise<void>
 toggleTaskStatus: (id: string) => Promise<void>
}
```


### 6. 型定義（src/types/task.ts）
```typescript
interface Task {
 id: string
 user_id: string
 title: string
 description?: string
 priority: 'high' | 'medium' | 'low'
 due_date?: Date
 status: 'pending' | 'completed'
 created_at: Date
 updated_at: Date
}
```


## 技術要件
- Supabaseでのデータ永続化
- リアルタイム更新（Supabase Realtime）
- 楽観的更新UI
- エラーハンドリング


## 完了条件
- [x] タスクのCRUD操作完了
- [x] 優先度設定機能動作確認
- [x] 期限管理機能動作確認
- [x] アラート通知表示確認
- [x] フィルター・ソート機能動作確認


## 注意事項
- CSS変数を使用したスタイリング
- レスポンシブデザイン対応
- アクセシビリティ対応
- パフォーマンス最適化（仮想スクロール検討）
