import { ClayCard, ClayCardContent } from "@/components/ui/clay-card";
import { Skeleton } from "@/components/ui/skeleton";

export const DebtCardSkeleton = () => {
  return (
    <ClayCard>
      <ClayCardContent className="p-4">
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <div className="text-right shrink-0 space-y-2">
              <Skeleton className="h-6 w-28 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <div className="block sm:hidden space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md ml-2" />
          </div>
          <Skeleton className="h-6 w-28 rounded" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};