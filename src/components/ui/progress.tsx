"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-white/10 relative h-2 w-full overflow-hidden rounded-full backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all duration-500 ease-out bg-gradient-to-r from-primary via-blue-400 to-primary rounded-full"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          boxShadow: '0 0 20px var(--primary-glow)',
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
