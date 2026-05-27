import type { MinutesDocument } from '@/types/minutes'

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildPlainText(doc: MinutesDocument): string {
  const { title, original_content, metadata, created_at } = doc
  const lines: string[] = []

  lines.push(title || '無題の議事録')
  lines.push(`作成日: ${formatDate(created_at)}`)
  lines.push('')
  lines.push('【議論された内容】')
  metadata.discussedTopics.forEach(t => lines.push(`・${t}`))
  lines.push('')
  lines.push('【決定事項】')
  metadata.decisions.forEach(d => lines.push(`・${d}`))
  lines.push('')
  lines.push('【ネクストアクション】')
  metadata.nextActions.forEach(a => {
    const assignee = a.assignee ? ` (担当: ${a.assignee})` : ''
    const due = a.dueDate ? ` [期日: ${a.dueDate}]` : ''
    lines.push(`・${a.task}${assignee}${due}`)
  })

  if (original_content?.trim()) {
    lines.push('')
    lines.push('【文字起こし全文】')
    lines.push(original_content)
  }

  return lines.join('\n')
}

function buildMarkdown(doc: MinutesDocument): string {
  const { title, original_content, metadata, created_at } = doc
  const lines: string[] = []

  lines.push(`# ${title || '無題の議事録'}`)
  lines.push(`> 作成日: ${formatDate(created_at)}`)
  lines.push('')

  lines.push('## 議論された内容')
  if (metadata.discussedTopics.length === 0) {
    lines.push('*記録なし*')
  } else {
    metadata.discussedTopics.forEach(t => lines.push(`- ${t}`))
  }
  lines.push('')

  lines.push('## 決定事項')
  if (metadata.decisions.length === 0) {
    lines.push('*記録なし*')
  } else {
    metadata.decisions.forEach(d => lines.push(`- ${d}`))
  }
  lines.push('')

  lines.push('## ネクストアクション')
  if (metadata.nextActions.length === 0) {
    lines.push('*記録なし*')
  } else {
    lines.push('| タスク | 担当者 | 期日 |')
    lines.push('|--------|--------|------|')
    metadata.nextActions.forEach(a => {
      lines.push(`| ${a.task} | ${a.assignee ?? '—'} | ${a.dueDate ?? '—'} |`)
    })
  }

  if (original_content?.trim()) {
    lines.push('')
    lines.push('## 文字起こし全文')
    lines.push('')
    lines.push(original_content)
  }

  return lines.join('\n')
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function safeFilename(title: string): string {
  return (title || '議事録').replace(/[/\\:*?"<>|]/g, '_').slice(0, 60)
}

export function exportAsTxt(doc: MinutesDocument): void {
  const content = buildPlainText(doc)
  downloadBlob(content, `${safeFilename(doc.title)}.txt`, 'text/plain')
}

export function exportAsMarkdown(doc: MinutesDocument): void {
  const content = buildMarkdown(doc)
  downloadBlob(content, `${safeFilename(doc.title)}.md`, 'text/markdown')
}

export function exportAsPdf(doc: MinutesDocument): void {
  const { title, original_content, metadata, created_at } = doc

  const topicsHtml = metadata.discussedTopics.length === 0
    ? '<p class="empty">記録なし</p>'
    : metadata.discussedTopics.map(t => `<li>${t}</li>`).join('')

  const decisionsHtml = metadata.decisions.length === 0
    ? '<p class="empty">記録なし</p>'
    : metadata.decisions.map(d => `<li>${d}</li>`).join('')

  const actionsHtml = metadata.nextActions.length === 0
    ? '<p class="empty">記録なし</p>'
    : `<table>
        <thead><tr><th>タスク</th><th>担当者</th><th>期日</th></tr></thead>
        <tbody>
          ${metadata.nextActions.map(a => `
            <tr>
              <td>${a.task}</td>
              <td>${a.assignee ?? '—'}</td>
              <td>${a.dueDate ?? '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`

  const transcriptHtml = original_content?.trim()
    ? `<section>
        <h2>文字起こし全文</h2>
        <pre>${original_content}</pre>
      </section>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${title || '議事録'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
      font-size: 12pt;
      color: #1a1a1a;
      padding: 32px 48px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 18pt; margin-bottom: 4px; }
    .date { color: #666; font-size: 10pt; margin-bottom: 24px; }
    section { margin-bottom: 24px; }
    h2 {
      font-size: 12pt;
      font-weight: 700;
      border-bottom: 1.5px solid #333;
      padding-bottom: 4px;
      margin-bottom: 12px;
    }
    ul { padding-left: 18px; }
    ul li { margin-bottom: 4px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; font-size: 11pt; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 10pt;
      color: #444;
      line-height: 1.7;
    }
    .empty { color: #999; font-style: italic; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <h1>${title || '無題の議事録'}</h1>
  <p class="date">作成日: ${formatDate(created_at)}</p>

  <section>
    <h2>議論された内容</h2>
    ${topicsHtml.startsWith('<p') ? topicsHtml : `<ul>${topicsHtml}</ul>`}
  </section>

  <section>
    <h2>決定事項</h2>
    ${decisionsHtml.startsWith('<p') ? decisionsHtml : `<ul>${decisionsHtml}</ul>`}
  </section>

  <section>
    <h2>ネクストアクション</h2>
    ${actionsHtml}
  </section>

  ${transcriptHtml}

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
