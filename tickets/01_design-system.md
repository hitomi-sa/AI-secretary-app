# Ticket #01: デザインシステム構築

**ステータス: 完了 ✅**

## 概要
Apple風のモダンなダークテーマデザインシステムを構築し、アプリ全体で使用する共通のスタイルとデザイントークンを定義する。

## 目的
- 一貫性のあるデザイン言語の確立
- CSS変数によるテーマ管理
- Tailwind設定のカスタマイズ

## 実装内容

### 1. Tailwind設定（tailwind.config.ts）
- CSS変数を使用したカラーシステムの定義
- フォントシステムの設定
- スペーシングシステムの設定
- ボーダー半径、シャドウの定義

### 2. CSS変数定義（globals.css）
- `:root` でのカラートークン定義
  - `--background`: 背景色
  - `--foreground`: テキスト色
  - `--primary`: プライマリカラー（iOS Blue #0A84FF）
  - `--secondary`: セカンダリカラー
  - `--accent`: アクセントカラー
  - `--destructive`: 削除・エラー色（iOS Red #FF453A）
  - `--muted`: ミュートカラー
  - `--border`: ボーダー色
  - `--ring`: フォーカスリング色
  - `--success`, `--warning`: ステータスカラー
  - `--surface-1` 〜 `--surface-4`: Apple HIG エレベーションレイヤー
- スペーシングトークン
- アニメーション定義（fade-in, slide-up, scale-in等）

### 3. タイポグラフィシステム
- 見出しスタイル（h1〜h6）
- 本文スタイル
- リンクスタイル
- コードブロックスタイル

## 技術要件
- ~~Tailwind CSS v4~~ → **Tailwind CSS v3.4.19**（v4から移行）
- CSS変数による動的テーマ
- レスポンシブ対応

## 完了条件
- [x] tailwind.config.tsの設定完了
- [x] globals.cssのCSS変数定義完了（Apple HIG Dark Mode準拠）
- [x] デザイントークンのドキュメント作成（globals.css内コメントで管理）
- [x] サンプルページでのスタイル確認（page.tsx・ビルド成功確認）

## 注意事項
- 生のHEX値（#FFFFFFなど）は使用しない ✅
- Tailwindのgray-*などの色ユーティリティは使用しない ✅
- すべての色はCSS変数経由で指定する ✅
- RootLayout（app/layout.tsx）は編集しない ✅
