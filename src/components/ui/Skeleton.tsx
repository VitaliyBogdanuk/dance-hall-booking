import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  variant = "text",
  width,
  height,
  animation = "wave",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = "bg-gray-200 rounded-control";

  const variantStyles = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-card",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const customStyle: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
    ...style,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={customStyle}
      aria-busy="true"
      aria-label="Loading"
      {...props}
    />
  );
}

// Pre-built skeleton components for common use cases
export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? "80%" : "100%"} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-surface rounded-card shadow-soft p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} className="mb-3" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonList({ items = 3, className = "" }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-surface rounded-card shadow-soft p-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="50%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
