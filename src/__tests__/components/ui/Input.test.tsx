import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('label が表示される', () => {
    render(<Input label="メールアドレス" />)
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByText('メールアドレス')).toBeInTheDocument()
  })

  it('placeholder が表示される', () => {
    render(<Input placeholder="例: test@example.com" />)
    expect(
      screen.getByPlaceholderText('例: test@example.com'),
    ).toBeInTheDocument()
  })

  it('error メッセージが表示される（aria-describedby 含む）', () => {
    render(<Input label="メール" error="必須項目です" />)
    const input = screen.getByLabelText('メール')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const errorEl = screen.getByText('必須項目です')
    expect(errorEl).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-describedby', errorEl.id)
  })

  it('hint テキストが表示される', () => {
    render(<Input label="パスワード" hint="8文字以上で入力してください" />)
    const input = screen.getByLabelText('パスワード')
    const hintEl = screen.getByText('8文字以上で入力してください')
    expect(hintEl).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-describedby', hintEl.id)
  })

  it('入力値の変更が onChange で発火する', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<Input onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('disabled 状態', () => {
    render(<Input label="名前" disabled />)
    expect(screen.getByLabelText('名前')).toBeDisabled()
  })
})
