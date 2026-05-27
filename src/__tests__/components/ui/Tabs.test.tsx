import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

function renderTabs(defaultValue = 'tab1') {
  return render(
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="tab1">タブ1</TabsTrigger>
        <TabsTrigger value="tab2">タブ2</TabsTrigger>
        <TabsTrigger value="tab3">タブ3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">コンテンツ1</TabsContent>
      <TabsContent value="tab2">コンテンツ2</TabsContent>
      <TabsContent value="tab3">コンテンツ3</TabsContent>
    </Tabs>,
  )
}

describe('Tabs', () => {
  it('defaultValue で初期タブが選択される', () => {
    renderTabs('tab1')
    expect(screen.getByText('コンテンツ1')).toBeInTheDocument()
    expect(screen.queryByText('コンテンツ2')).not.toBeInTheDocument()
  })

  it('タブクリックでコンテンツが切り替わる', async () => {
    const user = userEvent.setup()
    renderTabs('tab1')
    await user.click(screen.getByRole('tab', { name: 'タブ2' }))
    expect(screen.queryByText('コンテンツ1')).not.toBeInTheDocument()
    expect(screen.getByText('コンテンツ2')).toBeInTheDocument()
  })

  it('role="tablist" が設定されている', () => {
    renderTabs()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('role="tab" が設定されている', () => {
    renderTabs()
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)
  })

  it('role="tabpanel" が設定されている', () => {
    renderTabs()
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('aria-selected が正しく設定される（選択中のみ true）', () => {
    renderTabs('tab1')
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
  })

  it('タブ切り替え後に aria-selected が更新される', async () => {
    const user = userEvent.setup()
    renderTabs('tab1')
    await user.click(screen.getByRole('tab', { name: 'タブ3' }))
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
  })
})
