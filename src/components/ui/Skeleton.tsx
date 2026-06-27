import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-100', className)}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
      <Skeleton className="h-1 w-full rounded-none -mx-4 -mt-4 mb-4" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function SkeletonTaskCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 space-y-2">
      <Skeleton className="h-4 w-16 rounded-md" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}
