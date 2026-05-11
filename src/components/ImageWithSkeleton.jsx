"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";

export default function ImageWithSkeleton({
  alt,
  containerClassName,
  skeletonClassName,
  className,
  onLoad,
  onError,
  priority,
  quality,
  sizes,
  loading: loadingProp,
  fetchPriority: fetchPriorityProp,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const loading =
    loadingProp ?? (priority ? "eager" : "lazy");
  const fetchPriority =
    fetchPriorityProp ?? (priority ? "high" : undefined);

  void quality;

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!isLoaded && (
        <Skeleton
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-10 rounded-none bg-muted",
            skeletonClassName,
          )}
        />
      )}
      <img
        alt={alt}
        {...props}
        sizes={sizes}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={cn("relative z-0", className)}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setIsLoaded(true);
          onError?.(event);
        }}
      />
    </div>
  );
}
