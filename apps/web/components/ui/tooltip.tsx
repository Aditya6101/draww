import * as React from "react"
import { cn } from "@/lib/utils"

export function Tooltip({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="group relative inline-block">
      {children}
      <span className="invisible absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 dark:bg-gray-200 dark:text-black z-50">
        {title}
      </span>
    </div>
  )
}
