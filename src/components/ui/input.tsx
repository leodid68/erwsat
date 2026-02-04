import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "h-10 w-full min-w-0 rounded-xl px-4 py-2 text-base md:text-sm",
        "bg-white/5 border border-white/10 backdrop-blur-sm",
        "transition-all duration-200 outline-none",
        "hover:bg-white/8 hover:border-white/15",
        "focus-visible:bg-white/10 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
