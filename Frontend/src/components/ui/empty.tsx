import * as React from "react";
import { cn } from "@/lib/utils";

export function Empty({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 text-center",
        className
      )}
      {...props}
    />
  );
}

export function EmptyHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 max-w-md",
        className
      )}
      {...props}
    />
  );
}

export function EmptyTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "font-display text-lg font-medium tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function EmptyDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function EmptyContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4",
        className
      )}
      {...props}
    />
  );
}
