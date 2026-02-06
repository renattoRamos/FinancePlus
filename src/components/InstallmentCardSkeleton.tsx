import { ClayCard, ClayCardContent } from "@/components/ui/clay-card";
import { Skeleton } from "@/components/ui/skeleton";

export const InstallmentCardSkeleton = () => {
  return (
    <ClayCard>
      <ClayCardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md ml-2" />
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:items-end sm:justify-center gap-2">
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="flex gap-2 sm:mt-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};