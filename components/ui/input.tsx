import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "w-full min-w-0 rounded-lg border px-4 py-3 text-base transition-all outline-none",
        // Background and text
        "bg-white/5 text-white placeholder:text-gray-500",
        // Border styles
        "border-white/10",
        // Focus styles
        "focus:border-white/30 focus:bg-white/10 focus:ring-2 focus:ring-white/5",
        // Hover styles
        "hover:border-white/20",
        // Disabled styles
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5",
        // File input styles
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
        // Selection styles
        "selection:bg-white selection:text-black",
        // Invalid/Error styles
        "aria-invalid:border-red-500/50 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
        // Font size responsive
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
