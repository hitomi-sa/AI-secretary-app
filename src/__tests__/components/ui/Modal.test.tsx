import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/ui/Modal'

describe('Modal', () => {
  it('open=false では何も表示されない', () => {
    render(
      <Modal open={false} onClose={jest.fn()}>
        コンテンツ
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument()
  })

  it('open=true でモーダルが表示される', () => {
    render(
      <Modal open={true} onClose={jest.fn()}>
        モーダルコンテンツ
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('モーダルコンテンツ')).toBeInTheDocument()
  })

  it('× ボタンクリックで onClose が呼ばれる', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose} title="確認">
        内容
      </Modal>,
    )
    await user.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ESC キーで onClose が呼ばれる', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose}>
        内容
      </Modal>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('role="dialog" と aria-modal="true" が設定されている', () => {
    render(
      <Modal open={true} onClose={jest.fn()}>
        内容
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('title が指定されると aria-labelledby が設定される', () => {
    render(
      <Modal open={true} onClose={jest.fn()} title="タイトル">
        内容
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby')
    expect(screen.getByText('タイトル')).toBeInTheDocument()
  })
})
