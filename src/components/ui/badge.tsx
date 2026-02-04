import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary border border-primary/30 [a&]:hover:bg-primary/30",
        secondary:
          "bg-white/10 text-muted-foreground border border-white/10 [a&]:hover:bg-white/15",
        destructive:
          "bg-destructive/20 text-destructive border border-destructive/30 [a&]:hover:bg-destructive/30",
        outline:
          "border border-white/20 text-foreground [a&]:hover:bg-white/10",
        ghost: "[a&]:hover:bg-white/10",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        success: "bg-success/20 text-success border border-success/30",
        warning: "bg-warning/20 text-warning border border-warning/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
