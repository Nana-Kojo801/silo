import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function PostSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-14 rounded" />
        <Skeleton className="h-6 w-14 rounded" />
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <Skeleton className="h-24 w-full rounded-none" />
        <div className="p-5 space-y-4">
          <div className="flex items-end gap-4 -mt-8">
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <FeedSkeleton />
    </div>
  )
}
