'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import type { MinutesDocument, ActionItem } from '@/types/minutes'

interface UpdateData {
  title?: string
  discussedTopics?: string[]
  decisions?: string[]
  nextActions?: ActionItem[]
}

interface MinutesDisplayProps {
  document: MinutesDocument
  onUpdate: (data: UpdateData) => Promise<void>
}

// 表示用セクションヘッダー
function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
  )
}

// リスト表示（非編集）
function DisplayList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground italic">記録なし</p>
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ネクストアクション表示（非編集）
function ActionItemsDisplay({ actions }: { actions: ActionItem[] }) {
  if (actions.length === 0) {
    return <p className="text-sm text-muted-foreground italic">記録なし</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-3 text-xs font-medium text-muted-foreground w-1/2">タスク</th>
            <th className="text-left py-2 pr-3 text-xs font-medium text-muted-foreground w-1/4">担当者</th>
            <th className="text-left py-2 text-xs font-medium text-muted-foreground w-1/4">期日</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action, idx) => (
            <tr key={idx} className="border-b border-border/50 last:border-0">
              <td className="py-2 pr-3 text-foreground">{action.task}</td>
              <td className="py-2 pr-3 text-muted-foreground">{action.assignee ?? '—'}</td>
              <td className="py-2 text-muted-foreground">{action.dueDate ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ネクストアクション編集フォーム
function ActionItemEditor({
  action,
  index,
  onChange,
  onRemove,
}: {
  action: ActionItem
  index: number
  onChange: (index: number, field: keyof ActionItem, value: string) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-surface-2 border border-border/50">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">アクション {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-xs text-destructive hover:opacity-80 transition-smooth"
          aria-label={`アクション ${index + 1} を削除`}
        >
          削除
        </button>
      </div>
      <Input
        placeholder="タスク内容"
        value={action.task}
        onChange={e => onChange(index, 'task', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="担当者"
          value={action.assignee ?? ''}
          onChange={e => onChange(index, 'assignee', e.target.value)}
        />
        <Input
          placeholder="期日 (例: 2026-06-01)"
          value={action.dueDate ?? ''}
          onChange={e => onChange(index, 'dueDate', e.target.value)}
        />
      </div>
    </div>
  )
}

export function MinutesDisplay({ document, onUpdate }: MinutesDisplayProps) {
  const { metadata } = document
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 編集用ステート
  const [editTopics, setEditTopics] = useState(metadata.discussedTopics.join('\n'))
  const [editDecisions, setEditDecisions] = useState(metadata.decisions.join('\n'))
  const [editActions, setEditActions] = useState<ActionItem[]>(
    metadata.nextActions.map(a => ({ ...a }))
  )

  const handleEditStart = () => {
    setEditTopics(metadata.discussedTopics.join('\n'))
    setEditDecisions(metadata.decisions.join('\n'))
    setEditActions(metadata.nextActions.map(a => ({ ...a })))
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onUpdate({
        discussedTopics: editTopics.split('\n').map(s => s.trim()).filter(Boolean),
        decisions: editDecisions.split('\n').map(s => s.trim()).filter(Boolean),
        nextActions: editActions.filter(a => a.task.trim()),
      })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }, [editTopics, editDecisions, editActions, onUpdate])

  const handleActionChange = (index: number, field: keyof ActionItem, value: string) => {
    setEditActions(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleActionRemove = (index: number) => {
    setEditActions(prev => prev.filter((_, i) => i !== index))
  }

  const handleActionAdd = () => {
    setEditActions(prev => [...prev, { task: '', assignee: '', dueDate: '' }])
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ヘッダー：編集/保存トグル */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">議事録内容</h2>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={handleEditStart}>
            編集
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
              キャンセル
            </Button>
            <Button size="sm" onClick={handleSave} loading={isSaving}>
              保存
            </Button>
          </div>
        )}
      </div>

      {/* 議論された内容 */}
      <section>
        <SectionHeader title="議論された内容" />
        {isEditing ? (
          <Textarea
            value={editTopics}
            onChange={e => setEditTopics(e.target.value)}
            placeholder="1行に1項目を入力"
            rows={5}
            autoResize
            hint="1行に1項目"
          />
        ) : (
          <DisplayList items={metadata.discussedTopics} />
        )}
      </section>

      <div className="border-t border-border/50" />

      {/* 決定事項 */}
      <section>
        <SectionHeader title="決定事項" />
        {isEditing ? (
          <Textarea
            value={editDecisions}
            onChange={e => setEditDecisions(e.target.value)}
            placeholder="1行に1項目を入力"
            rows={4}
            autoResize
            hint="1行に1項目"
          />
        ) : (
          <DisplayList items={metadata.decisions} />
        )}
      </section>

      <div className="border-t border-border/50" />

      {/* ネクストアクション */}
      <section>
        <SectionHeader title="ネクストアクション" />
        {isEditing ? (
          <div className="flex flex-col gap-2">
            {editActions.map((action, idx) => (
              <ActionItemEditor
                key={idx}
                action={action}
                index={idx}
                onChange={handleActionChange}
                onRemove={handleActionRemove}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleActionAdd}
              className="self-start"
            >
              + アクションを追加
            </Button>
          </div>
        ) : (
          <ActionItemsDisplay actions={metadata.nextActions} />
        )}
      </section>
    </div>
  )
}
