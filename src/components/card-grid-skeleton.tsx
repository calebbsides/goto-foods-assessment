import { Skeleton } from "@/components/ui/skeleton";

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section aria-label="Loading cards" aria-busy className="space-y-5">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Skeleton className="aspect-[3/4] rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
