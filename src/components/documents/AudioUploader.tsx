'use client'

import React, { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useAudioUpload } from '@/hooks/documents/useAudioUpload'

const ACCEPTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'video/webm', 'audio/webm']
const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 * 1024 // 5GB

interface AudioUploaderProps {
  onUploadComplete: (documentId: string) => void
  onError: (message: string) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function AudioUploader({ onUploadComplete, onError }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isUploading, upload } = useAudioUpload()

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE_BYTES) {
      return `ファイルサイズが上限（5GB）を超えています（${formatFileSize(file.size)}）`
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidType = ACCEPTED_FORMATS.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext)
    if (!isValidType) {
      return '対応していないファイル形式です。mp3, wav, m4a, webm のいずれかを選択してください'
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setValidationError(error)
      setSelectedFile(null)
      return
    }
    setValidationError(null)
    setSelectedFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return
    const documentId = await upload(selectedFile, meetingTitle || undefined)
    if (documentId) {
      onUploadComplete(documentId)
    } else {
      onError('アップロードに失敗しました。もう一度お試しください。')
    }
  }, [selectedFile, meetingTitle, upload, onUploadComplete, onError])

  const handleZoneClick = () => {
    if (!isUploading) fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ドラッグ&ドロップエリア */}
      <div
        role="button"
        tabIndex={0}
        aria-label="音声ファイルをアップロード"
        onClick={handleZoneClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleZoneClick() }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'min-h-[180px] rounded-xl border-2 border-dashed',
          'transition-smooth cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : selectedFile
            ? 'border-success/60 bg-success/5'
            : 'border-border hover:border-primary/60 hover:bg-surface-1',
          isUploading && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" color="primary" />
            <p className="text-sm text-muted-foreground">アップロード中...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            {/* ファイルアイコン */}
            <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" className="text-success" />
                <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-success" />
                <path d="M7 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-success" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground truncate max-w-[240px]">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(selectedFile.size)}</p>
            </div>
            <p className="text-xs text-muted-foreground">クリックして別のファイルを選択</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-muted-foreground">
                <path d="M10 13V4M10 4L7 7M10 4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                ファイルをドラッグ&ドロップ
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                またはクリックしてファイルを選択
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              対応形式: mp3, wav, m4a, webm &nbsp;|&nbsp; 最大 5GB
            </p>
          </div>
        )}
      </div>

      {/* バリデーションエラー */}
      {validationError && (
        <p className="text-xs text-destructive">{validationError}</p>
      )}

      {/* 会議タイトル入力 */}
      <Input
        label="会議タイトル（任意）"
        placeholder="例: 2026年5月 月次定例"
        value={meetingTitle}
        onChange={e => setMeetingTitle(e.target.value)}
        disabled={isUploading}
      />

      {/* アップロードボタン */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        loading={isUploading}
        className="w-full"
      >
        {isUploading ? 'アップロード中...' : 'アップロードして文字起こし開始'}
      </Button>
    </div>
  )
}
