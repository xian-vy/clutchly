import { AuthLayout } from '@/components/auth/AuthLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function UpdatePasswordLoading() {
  return (
    <AuthLayout mode="signin">
      <div className="w-full max-w-md space-y-3 sm:space-y-5 md:space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4 sm:space-y-5 3xl:!space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-full" />
          </div>

          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </AuthLayout>
  )
} 