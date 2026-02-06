"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarVariants = cva(
  "flex h-full flex-col overflow-hidden bg-sidebar-background text-sidebar-foreground",
  {
    variants: {
      variant: {
        default: "border-r border-sidebar-border",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof sidebarVariants> {
  openMobile?: boolean;
  setOpenMobile?: (open: boolean) => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    { className, variant, openMobile, setOpenMobile, children, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(sidebarVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
);
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    openMobile?: boolean;
    setOpenMobile?: (open: boolean) => void;
  }
>(({ className, openMobile, setOpenMobile, ...props }, ref) => (
  <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
    <SheetTrigger asChild>
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("md:hidden", className)}
        {...props}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="w-64 p-0">
      <Sidebar className="h-full">{props.children}</Sidebar>
    </SheetContent>
  </Sheet>
));
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between border-b border-sidebar-border p-4",
      className
    )}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarHeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-lg font-semibold text-sidebar-primary", className)}
    {...props}
  />
));
SidebarHeaderTitle.displayName = "SidebarHeaderTitle";

const SidebarDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-sidebar-foreground", className)}
    {...props}
  />
));
SidebarDescription.displayName = "SidebarDescription";

const SidebarNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-2", className)} {...props} />
));
SidebarNav.displayName = "SidebarNav";

const SidebarNavLink = React.forwardRef<
  HTMLButtonElement, // Alterado para HTMLButtonElement
  React.ComponentProps<typeof Button> & {
    isActive?: boolean;
  }
>(({ className, isActive, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={cn(
      "mb-2 w-full justify-start",
      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
      className
    )}
    {...props}
  />
));
SidebarNavLink.displayName = "SidebarNavLink";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto border-t border-sidebar-border p-4",
      className
    )}
    {...props}
  />
)); // Parêntese de fechamento adicionado aqui
SidebarFooter.displayName = "SidebarFooter";

export {
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarDescription,
  SidebarNav,
  SidebarNavLink,
  SidebarFooter,
};