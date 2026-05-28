export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-24">
        <div className="flex flex-col gap-3">
          <h1 className="text-gradient-blue text-4xl font-bold tracking-tight">
            AI Secretary
          </h1>
          <p className="text-muted-foreground text-base">
            一つのアプリでルーティン業務を完結する、統合型AIアシスタント
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: 'タスク管理', desc: 'Todo・期限・優先度', href: '/dashboard/tasks' },
            { label: '文章校正', desc: 'メール・報告書を AI 校正', href: '/dashboard/documents/proofread' },
            { label: '議事録作成', desc: '音声 → 自動文字起こし', href: '/dashboard/documents/minutes' },
            { label: 'リサーチ', desc: 'Perplexity で最新情報収集', href: '/dashboard/documents/research' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-1 rounded-[var(--radius)] bg-card p-4 inset-highlight transition-smooth hover:bg-accent active-scale border border-border/50"
            >
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}
