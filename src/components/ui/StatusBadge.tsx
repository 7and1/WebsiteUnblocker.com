import { ShieldCheck, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusVariant = 'accessible' | 'blocked' | 'error' | 'loading'

type StatusBadgeProps = {
  status: StatusVariant
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusStyles: Record<StatusVariant, { bg: string; text: string; icon: typeof ShieldCheck }> = {
  accessible: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    icon: ShieldCheck,
  },
  blocked: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    icon: ShieldAlert,
  },
  error: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    icon: AlertTriangle,
  },
  loading: {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    icon: Loader2,
  },
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const defaultLabels: Record<StatusVariant, string> = {
  accessible: 'Accessible',
  blocked: 'Blocked',
  error: 'Error',
  loading: 'Checking...',
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const styles = statusStyles[status]
  const Icon = styles.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        sizeClasses[size],
        styles.bg,
        styles.text
      )}
    >
      <Icon
        className={cn(iconSizes[size], status === 'loading' && 'animate-spin')}
        aria-hidden="true"
      />
      {label ?? defaultLabels[status]}
    </span>
  )
}

export type { StatusVariant }
