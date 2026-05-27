import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert } from '@/components/ui/Alert'

describe('Alert', () => {
  it.each(['info', 'success', 'warning', 'error'] as const)(
    'variant="%s" でレンダリングされる',
    (variant) => {
      render(<Alert variant={variant}>メッセージ</Alert>)
      expect(screen.getByText('メッセージ')).toBeInTheDocument()
    },
  )

  it('role="alert" が付与されている', () => {
    render(<Alert>メッセージ</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('title が表示される', () => {
    render(<Alert title="エラーが発生しました">詳細メッセージ</Alert>)
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('詳細メッセージ')).toBeInTheDocument()
  })

  it('onClose が指定されると閉じるボタンが表示される', () => {
    render(<Alert onClose={jest.fn()}>メッセージ</Alert>)
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument()
  })

  it('onClose が指定されない場合は閉じるボタンが表示されない', () => {
    render(<Alert>メッセージ</Alert>)
    expect(screen.queryByRole('button', { name: '閉じる' })).not.toBeInTheDocument()
  })

  it('閉じるボタンクリックで onClose が呼ばれる', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<Alert onClose={onClose}>メッセージ</Alert>)
    await user.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
