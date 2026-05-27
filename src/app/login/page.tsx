'use client'

import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width="44"
      height="44"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="rgb(var(--primary))" />
      <path
        d="M20 8 L30 26 L10 26 Z"
        fill="rgb(var(--primary-foreground))"
        opacity="0.9"
      />
      <circle cx="20" cy="29" r="3" fill="rgb(var(--primary-foreground))" opacity="0.7" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error') === 'auth_error'
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      setIsSigningIn(false)
    }
  }

  return (
    <div
      className="
        bg-card
        rounded-[var(--radius-2xl)]
        border border-border/50
        p-8
        shadow-lg
        w-full max-w-sm
        flex flex-col items-center gap-6
        animate-scale-in
      "
    >
      {/* App icon + name */}
      <div className="flex flex-col items-center gap-3">
        <AppIcon />
        <div className="text-center">
          <h1 className="text-[var(--font-size-xl)] font-semibold tracking-tight text-foreground">
            AI Secretary
          </h1>
          <p className="text-[var(--font-size-sm)] text-muted-foreground mt-1">
            あなた専属のAI秘書
          </p>
        </div>
      </div>

      {/* Error message */}
      {hasError && (
        <div
          className="
            w-full
            rounded-[var(--radius)]
            bg-destructive/10
            border border-destructive/30
            px-4 py-3
            text-[var(--font-size-sm)]
            text-destructive
            text-center
          "
          role="alert"
        >
          認証に失敗しました。もう一度お試しください。
        </div>
      )}

      {/* Sign in button */}
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="
          w-full
          flex items-center justify-center gap-3
          bg-surface-3 hover:bg-accent
          border border-border
          text-foreground
          text-[var(--font-size-sm)] font-medium
          rounded-[var(--radius)]
          px-4 py-3
          transition-smooth
          active-scale
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-2 focus-visible:outline-offset-2
        "
        aria-busy={isSigningIn}
      >
        {isSigningIn ? (
          <>
            <Spinner />
            <span>サインイン中...</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>Googleでサインイン</span>
          </>
        )}
      </button>

      <p className="text-[var(--font-size-xs)] text-muted-foreground text-center leading-relaxed">
        続行することで、利用規約およびプライバシーポリシーに同意したことになります。
      </p>
    </div>
  )
}
