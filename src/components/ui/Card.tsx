import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)} {...props} />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('p-6 border-b border-slate-100', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('p-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}
