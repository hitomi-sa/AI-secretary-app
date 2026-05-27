'use client'

import { useState, useCallback } from 'react'

interface UploadState {
  isUploading: boolean
  documentId: string | null
  error: string | null
}

interface UseAudioUploadReturn extends UploadState {
  upload: (file: File, meetingTitle?: string) => Promise<string | null>
  reset: () => void
}

export function useAudioUpload(): UseAudioUploadReturn {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    documentId: null,
    error: null,
  })

  const upload = useCallback(async (file: File, meetingTitle?: string): Promise<string | null> => {
    setState({ isUploading: true, documentId: null, error: null })

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (meetingTitle) {
        formData.append('meetingTitle', meetingTitle)
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.error ?? 'アップロードに失敗しました'
        setState({ isUploading: false, documentId: null, error: errorMsg })
        return null
      }

      const { documentId } = data as { documentId: string }
      setState({ isUploading: false, documentId, error: null })
      return documentId
    } catch {
      setState({ isUploading: false, documentId: null, error: '通信エラーが発生しました' })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ isUploading: false, documentId: null, error: null })
  }, [])

  return { ...state, upload, reset }
}
