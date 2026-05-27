import Link from 'next/link'

interface NavigationItemProps {
  href: string
  label: string
  icon: React.ReactNode
  active?: boolean
  badge?: number
}

export default function NavigationItem({
  href,
  label,
  icon,
  active = false,
  badge,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={[
        'rounded-[var(--radius)] px-3 py-2 flex items-center gap-3 text-sm transition-smooth',
        active
          ? 'bg-surface-3 text-foreground font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      ].join(' ')}
    >
      <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}
