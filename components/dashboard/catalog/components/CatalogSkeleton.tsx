import { Skeleton } from '@/components/ui/skeleton';

export default function CatalogSkeleton() {
  return (
    <main className="min-h-screen bg-background w-full pb-5">
      {/* Top bar */}
      <div className="flex justify-between items-center bg-primary w-full text-white dark:text-black min-h-[30px] px-2 sm:px-4">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>

      {/* Catalog Intro Skeleton */}
      <div className="bg-muted/30 border-b py-6 flex flex-col items-start justify-center text-center gap-4 sm:gap-5 xl:gap-6 px-5 sm:px-6 lg:px-10 w-full">
        <div className="flex justify-between items-center w-full">
            <div className="flex gap-3 items-center justify-start ">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-6 w-24 md:w-28 lg:w-32 rounded-lg" />
            </div>
            <div className="flex gap-3 lg:gap-4 items-center justify-start">
                <Skeleton className="h-4 w-10 lg:w-12 rounded-lg" />
                <Skeleton className="h-4 w-10 lg:w-12 rounded-lg" />
                <Skeleton className="h-4 w-10 lg:w-12 rounded-lg" />
            </div>
        </div>
        <div className="space-y-2 lg:space-y-3">
            <Skeleton className="h-4 w-[300px] lg:w-[500px] rounded-sm" />
            <Skeleton className="h-4 w-[300px] lg:w-[500px] xl:w-[600px] rounded-sm" />
            <Skeleton className="h-4 w-[300px] lg:w-[500px] rounded-sm lg:hidden" />
        </div>
      </div>

      <div className=" px-6 xl:px-16 2xl:px-24 3xl:px-0 w-full">
        {/* Disclaimer Alert Skeleton */}
        <div className="mt-5 sm:w-full  w-full">
          <div className="flex items-start gap-3 p-4 border rounded-lg bg-card w-full">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-3 w-16 lg:w-20 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-10/12 rounded " />
              <Skeleton className="h-3 w-full rounded lg:hidden" />
              <Skeleton className="h-3 w-11/12 rounded lg:hidden" />
              <Skeleton className="h-3 w-full rounded lg:hidden" />
            </div>
          </div>
        </div>


        {/* Featured Reptiles Skeleton */}
        <div className="my-9 xl:px-4 ">
          <Skeleton className="h-6 w-40 lg:w-48 xl:w-56 rounded-lg mb-2" />
          <Skeleton className="h-4 w-48 lg:w-56 xl:w-72 rounded-lg mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mt-3 lg:mt-5 xl:mt-7">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 mt-2 rounded" />
                <Skeleton className="h-3 w-1/2 mt-1 rounded" />
                <div className="flex justify-between mt-1">
                  <Skeleton className="h-4 w-10 rounded" />
                  <Skeleton className="h-4 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Reptiles Skeleton Grid */}
        <div>
          <Skeleton className="h-6 w-40 rounded mb-2" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 3xl:!grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 mt-2 rounded" />
                <Skeleton className="h-3 w-1/2 mt-1 rounded" />
                <div className="flex justify-between mt-1">
                  <Skeleton className="h-4 w-10 rounded" />
                  <Skeleton className="h-4 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer className="border-t pt-8 xl:pt-12 flex flex-col items-center w-full gap-4 xl:gap-5 bg-background/90 mt-8">
        <Skeleton className="h-10 w-10 rounded-full mb-2" />
        <Skeleton className="h-6 w-32 rounded mb-2" />
        <Skeleton className="h-4 w-40 rounded mb-2" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="h-4 w-32 rounded mt-4" />
      </footer>
    </main>
  );
} 