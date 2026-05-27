import { type ReactNode, Suspense } from 'react'
import AuthProvider from '@/contexts/AuthContext'

// Auth state and search params require runtime — skip static prerender
export const dynamic = 'force-dynamic'

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Suspense>{children}</Suspense>
      </div>
    </AuthProvider>
  )
}
