import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('デフォルト（primary）でレンダリングされる', () => {
    render(<Button>クリック</Button>)
    const btn = screen.getByRole('button', { name: 'クリック' })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toBeDisabled()
  })

  it.each(['secondary', 'outline', 'ghost', 'destructive'] as const)(
    'variant="%s" でレンダリングされる',
    (variant) => {
      render(<Button variant={variant}>ボタン</Button>)
      expect(screen.getByRole('button', { name: 'ボタン' })).toBeInTheDocument()
    },
  )

  it.each(['sm', 'md', 'lg'] as const)('size="%s" でレンダリングされる', (size) => {
    render(<Button size={size}>ボタン</Button>)
    expect(screen.getByRole('button', { name: 'ボタン' })).toBeInTheDocument()
  })

  it('loading=true でスピナーが表示され disabled になる', () => {
    render(<Button loading>送信中</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    // Spinner は role="status" を持つ
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('disabled=true でクリックイベントが発火しない', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<Button disabled onClick={onClick}>ボタン</Button>)
    const btn = screen.getByRole('button', { name: 'ボタン' })
    expect(btn).toBeDisabled()
    // disabled ボタンへのクリックは userEvent がスキップする
    await user.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('onClick ハンドラが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<Button onClick={onClick}>ボタン</Button>)
    await user.click(screen.getByRole('button', { name: 'ボタン' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('icon prop でアイコンが表示される', () => {
    render(
      <Button icon={<span data-testid="icon">★</span>}>ボタン</Button>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
