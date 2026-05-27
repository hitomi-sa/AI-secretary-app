# Ticket #03: ページレイアウト構築

**ステータス: 完了 ✅**

## 概要
各ページ用のレイアウトコンポーネント（Header、Sidebar）を作成し、ダッシュボード構造を構築する。

## 目的
- 統一されたページ構造の確立
- ナビゲーション機能の実装
- レスポンシブ対応のレイアウト

## 実装内容

### 1. DashboardLayout（src/app/dashboard/layout.tsx）✅
- ダッシュボード全体のレイアウト管理
- Sidebar・Header・Main領域の配置
- レスポンシブ対応（モバイルメニュー）
- `export const dynamic = 'force-dynamic'`（Supabase対応）

### 2. Header コンポーネント（src/components/layout/Header.tsx）✅
- ページタイトル表示（usePathnameから自動解決）
- ユーザーメニュー
- モバイル用ハンバーガーボタン
- sticky + backdrop-blur

### 3. Sidebar コンポーネント（src/components/layout/Sidebar.tsx）✅
- ナビゲーションメニュー（ダッシュボード/タスク/カレンダー/文章校正/議事録/リサーチ）
- アクティブ状態の表示（usePathname）
- インラインSVGアイコン付きメニュー項目

### 4. UserMenu コンポーネント（src/components/layout/UserMenu.tsx）✅
- シンプルなアバター表示（ログイン不要のため簡易版）

### 5. NavigationItem コンポーネント（src/components/layout/NavigationItem.tsx）✅
- メニュー項目の共通コンポーネント
- アイコン、ラベル、バッジ対応
- アクティブ状態スタイル
- ホバーエフェクト

### 6. MobileMenu コンポーネント（src/components/layout/MobileMenu.tsx）✅
- スライドイン/アウトアニメーション
- オーバーレイ
- ルート変更で自動クローズ

## ページ構造（全スタブ実装済み）
```
/dashboard
  ├── layout.tsx ✅
  ├── DashboardShell.tsx ✅
  ├── page.tsx ✅
  ├── tasks/page.tsx ✅
  ├── calendar/page.tsx ✅
  └── documents/
      ├── proofread/page.tsx ✅
      ├── minutes/page.tsx ✅
      └── research/page.tsx ✅
```

## 技術要件
- Next.js App Router対応 ✅
- CSS変数使用（bg-background等）✅
- レスポンシブブレークポイント対応 ✅
- アクセシビリティ対応 ✅

## 完了条件
- [x] DashboardLayout実装完了
- [x] Header/Sidebar実装完了
- [x] ナビゲーション機能動作確認
- [x] レスポンシブ対応確認（モバイルメニュー実装）
- [x] 各ページへのルーティング確認

## 注意事項
- RootLayout（app/layout.tsx）は編集しない ✅
- 色指定はCSS変数のみ使用 ✅
- ナビゲーションはNext.js Linkコンポーネント使用 ✅
