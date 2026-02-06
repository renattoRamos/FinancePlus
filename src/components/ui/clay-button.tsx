"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-clay-soft hover:shadow-clay-medium active:shadow-clay-inset transition-clay",
        destructive:
          "bg-destructive text-destructive-foreground shadow-clay-soft hover:shadow-clay-medium active:shadow-clay-inset transition-clay",
        outline:
          "border border-border bg-background shadow-clay-soft hover:shadow-clay-medium active:shadow-clay-inset transition-clay",
        secondary:
          "bg-secondary text-secondary-foreground shadow-clay-soft hover:shadow-clay-medium active:shadow-clay-inset transition-clay",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
        pressed: "bg-primary/10 text-primary shadow-clay-inset transition-clay",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ClayButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const ClayButton = React.forwardRef<HTMLButtonElement, ClayButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ClayButton.displayName = "ClayButton";

export { ClayButton, buttonVariants };