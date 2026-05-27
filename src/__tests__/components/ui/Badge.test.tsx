import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from '@/components/ui/Badge'

describe('Badge', () => {
  it.each(['default', 'primary', 'success', 'warning', 'destructive', 'outline'] as const)(
    'variant="%s" でレンダリングされる',
    (variant) => {
      render(<Badge variant={variant}>タグ</Badge>)
      expect(screen.getByText('タグ')).toBeInTheDocument()
    },
  )

  it('onRemove が指定されると削除ボタンが表示される', () => {
    render(<Badge onRemove={jest.fn()}>タグ</Badge>)
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('onRemove が指定されない場合は削除ボタンが表示されない', () => {
    render(<Badge>タグ</Badge>)
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
  })

  it('削除ボタンクリックで onRemove が呼ばれる', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()
    render(<Badge onRemove={onRemove}>タグ</Badge>)
    await user.click(screen.getByRole('button', { name: '削除' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
