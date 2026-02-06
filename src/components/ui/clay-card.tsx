import * as React from "react";
import { cn } from "@/lib/utils";

const ClayCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl bg-gradient-clay shadow-clay-medium border border-border/30 p-6 transition-clay hover:shadow-clay-strong",
      className
    )}
    {...props}
  />
));
ClayCard.displayName = "ClayCard";

const ClayCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 pb-4", className)}
    {...props}
  />
));
ClayCardHeader.displayName = "ClayCardHeader";

const ClayCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
ClayCardTitle.displayName = "ClayCardTitle";

const ClayCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ClayCardDescription.displayName = "ClayCardDescription";

const ClayCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
ClayCardContent.displayName = "ClayCardContent";

const ClayCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
ClayCardFooter.displayName = "ClayCardFooter";

export { ClayCard, ClayCardHeader, ClayCardFooter, ClayCardTitle, ClayCardDescription, ClayCardContent };