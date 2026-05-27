import React from 'react'
import { render, screen } from '@testing-library/react'
import NavigationItem from '@/components/layout/NavigationItem'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
    ...props
  }: {
    href: string
    children: React.ReactNode
    className?: string
    [key: string]: unknown
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}))

describe('NavigationItem', () => {
  const icon = <svg data-testid="nav-icon" />

  it('href と label が正しくレンダリングされる', () => {
    render(<NavigationItem href="/dashboard" label="ダッシュボード" icon={icon} />)
    const link = screen.getByRole('link', { name: /ダッシュボード/ })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument()
  })

  it('active=true でアクティブスタイルクラスが適用される', () => {
    render(
      <NavigationItem href="/dashboard" label="ダッシュボード" icon={icon} active />,
    )
    const link = screen.getByRole('link', { name: /ダッシュボード/ })
    expect(link.className).toContain('bg-surface-3')
    expect(link.className).toContain('font-medium')
  })

  it('active=false（デフォルト）ではアクティブスタイルが適用されない', () => {
    render(
      <NavigationItem href="/dashboard" label="ダッシュボード" icon={icon} />,
    )
    const link = screen.getByRole('link', { name: /ダッシュボード/ })
    expect(link.className).not.toContain('bg-surface-3')
  })

  it('badge 数値が表示される', () => {
    render(
      <NavigationItem href="/tasks" label="タスク" icon={icon} badge={5} />,
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('badge=0 のときバッジは表示されない', () => {
    render(
      <NavigationItem href="/tasks" label="タスク" icon={icon} badge={0} />,
    )
    // バッジ要素が存在しないことを確認（label テキストは除く）
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('badge=100 のとき "99+" が表示される', () => {
    render(
      <NavigationItem href="/tasks" label="タスク" icon={icon} badge={100} />,
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
  })
})
