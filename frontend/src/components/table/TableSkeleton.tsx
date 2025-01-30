import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div
      className="
      mx-auto max-w-[90%] xl:max-w-[80%]
      flex justify-center items-center space-x-4
      "
    >
      <div className="p-4 w-full h-auto flex flex-col space-y-4">
        <Skeleton className="h-14 w-full bg-skeleton" />
        <Skeleton className="h-14 w-full bg-skeleton" />
        <Skeleton className="h-14 w-full bg-skeleton" />
        <Skeleton className="h-14 w-full bg-skeleton" />
        <Skeleton className="h-14 w-full bg-skeleton" />
        <Skeleton className="h-14 w-full bg-skeleton" />
      </div>
    </div>
  );
}
