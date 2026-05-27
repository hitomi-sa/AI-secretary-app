# Ticket #04: データベース基盤構築

**ステータス: 完了 ✅**

## 概要
SupabaseでのデータベースとRow Level Security (RLS)の設定を行い、データ永続化の基盤を構築する。

## 目的
- データベーステーブルの作成
- セキュリティポリシーの設定
- データアクセス層の実装

## 実装内容

### 1. Supabaseプロジェクト設定
- プロジェクト作成 ✅（fmhjcjjzovwxwzapdaey.supabase.co）
- 環境変数設定
  - `NEXT_PUBLIC_SUPABASE_URL` ✅
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
  - `SUPABASE_SERVICE_KEY` ✅

### 2. データベーステーブル作成
```sql
-- users テーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  google_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tasks テーブル
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- documents テーブル
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('proofread', 'minutes', 'research')),
  title TEXT NOT NULL,
  original_content TEXT,
  processed_content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- writing_styles テーブル
CREATE TABLE writing_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  style_patterns JSONB,
  sample_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS) 設定
- 各テーブルでRLSを有効化
- ユーザーは自分のデータのみアクセス可能
- ポリシー設定

### 4. Supabaseクライアント設定 ✅
- `src/lib/supabase/client.ts` — ブラウザ用クライアント ✅
- `src/lib/supabase/server.ts` — Server Components用クライアント ✅
- `src/lib/supabase/middleware.ts` — ミドルウェア用クライアント ✅

### 5. データベース型定義（src/types/database.ts）
- Supabase TypeScriptタイプ生成 ✅（Task / Document / WritingStyle 型定義済み）

### 6. データアクセス層（src/lib/supabase/）
- `tasks.ts`: タスク関連操作 ✅
- `documents.ts`: ドキュメント関連操作 ✅

## 技術要件
- Supabase ✅
- TypeScript型安全性
- エラーハンドリング

## 完了条件
- [x] Supabaseプロジェクト作成完了
- [x] 全テーブル作成完了（tasks / documents / writing_styles）
- [x] RLSポリシー設定完了（全テーブルで有効化済み）
- [x] TypeScript型定義完了
- [x] 基本的なCRUD操作実装完了（tasks.ts / documents.ts）

## 注意事項
- 環境変数は.env.localに記載 ✅
- usersテーブルは作成せず Supabase Auth の auth.users を使用
- マイグレーション履歴は未記録（ダッシュボードで直接作成）
