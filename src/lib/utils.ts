import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * UTC ISO 文字列から Asia/Tokyo ローカル日付 (YYYY-MM-DD) を返す。
 * サーバーサイドで UTC タイムスタンプをスライスすると JST でずれるため、
 * Intl.DateTimeFormat で正しいローカル日付を取得する。
 */
export function toTokyoDateString(utcIso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(
    new Date(utcIso),
  )
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMin = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffMs < 0) return '期限切れ'
  if (diffMin < 60) return `${diffMin}分後`
  if (diffHours < 24) return `${diffHours}時間後`
  return `${diffDays}日後`
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000)

  if (diffDays < 0) return `${Math.abs(diffDays)}日前`
  if (diffDays === 0) return '今日'
  if (diffDays === 1) return '明日'
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export function isDueSoon(dateStr: string | null): boolean {
  if (!dateStr) return false
  const due = new Date(dateStr)
  const now = new Date()
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  return due >= now && due <= twoDaysLater
}
