# Ticket #02: 共通UIコンポーネント作成

**ステータス: 完了 ✅**

## 概要
アプリ全体で使用する共通UIコンポーネントをApple風のデザインで実装する。

## 目的
- 再利用可能なコンポーネントライブラリの構築
- 一貫性のあるUI体験の提供
- 開発効率の向上

## 実装内容

### 1. Button コンポーネント（src/components/ui/Button.tsx）✅
- バリアント: primary, secondary, outline, ghost, destructive
- サイズ: sm, md, lg
- 状態: loading, disabled
- アイコン対応

### 2. Input コンポーネント（src/components/ui/Input.tsx）✅
- タイプ: text, email, password, number, search
- バリデーション表示
- ラベル・プレースホルダー対応
- エラー状態表示

### 3. Card コンポーネント（src/components/ui/Card.tsx）✅
- ヘッダー、ボディ、フッター構造
- ホバーエフェクト
- クリック可能バリアント

### 4. Modal コンポーネント（src/components/ui/Modal.tsx）✅
- オーバーレイ
- アニメーション
- サイズバリエーション
- 閉じるボタン

### 5. Alert コンポーネント（src/components/ui/Alert.tsx）✅
- タイプ: info, success, warning, error
- 閉じるボタンオプション
- アイコン表示

### 6. Select コンポーネント（src/components/ui/Select.tsx）✅
- ドロップダウンメニュー（カスタム実装）
- キーボード操作対応（↑↓/Enter/ESC）
- ※ マルチセレクトは未実装（現時点で要件なし）

### 7. Textarea コンポーネント（src/components/ui/Textarea.tsx）✅
- 自動リサイズ
- 文字数カウンター
- バリデーション表示

### 8. Badge コンポーネント（src/components/ui/Badge.tsx）✅
- カラーバリエーション（default/primary/success/warning/destructive/outline）
- サイズバリエーション（sm/md）
- 削除可能バリアント

### 9. Spinner コンポーネント（src/components/ui/Spinner.tsx）✅
- サイズバリエーション（xs/sm/md/lg）
- カラーバリエーション

### 10. Tabs コンポーネント（src/components/ui/Tabs.tsx）✅
- タブナビゲーション
- アクティブ状態
- アイコン対応

### ユーティリティ
- `src/lib/utils.ts` — `cn()` ヘルパー（clsx + tailwind-merge）✅
- `src/components/ui/index.ts` — バレルエクスポート ✅

## 技術要件
- TypeScript対応 ✅
- CSS変数使用（bg-background, text-foreground等）✅
- アクセシビリティ対応（ARIA属性）✅
- レスポンシブデザイン ✅

## 完了条件
- [x] 全コンポーネントの実装完了（10コンポーネント）
- [x] TypeScript型定義完了（tsc --noEmit エラーゼロ）
- [x] コンポーネントのPropsドキュメント作成（型定義で管理）
- [ ] ストーリーブック（スキップ — 現フェーズでは不要）

## テスト結果
- Jest テスト 55件 全パス ✅
- Button / Input / Badge / Alert / Tabs / Modal / NavigationItem をカバー

## 注意事項
- 色指定にはCSS変数のみ使用 ✅
- gray-*などのTailwindカラーユーティリティは使用禁止 ✅
- コンポーネントは純粋で再利用可能に設計 ✅
