"use client"

import * as React from "react"
import { createContext, forwardRef, useContext, useState } from "react"
import { cn } from "../../lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

const SidebarContext = createContext<{
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  collapsedMode: "icon" | "expand"
  setCollapsedMode: React.Dispatch<React.SetStateAction<"icon" | "expand">>
}>({
  collapsed: false,
  setCollapsed: () => {},
  collapsedMode: "icon",
  setCollapsedMode: () => {},
})

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean
  defaultCollapsedMode?: "icon" | "expand"
  collapsible?: boolean
}

const SidebarProvider = ({
  defaultCollapsed = false,
  defaultCollapsedMode = "icon",
  collapsible = true,
  children,
  className,
  ...props
}: SidebarProviderProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [collapsedMode, setCollapsedMode] =
    useState<"icon" | "expand">(defaultCollapsedMode)

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        collapsedMode,
        setCollapsedMode,
      }}
    >
      <div
        className={cn(
          "sidebar grid grid-cols-[auto_1fr] h-full",
          className
        )}
        data-collapsible={collapsible ? collapsedMode : null}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { collapsed, setCollapsed } = useContext(SidebarContext)

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 shrink-0 rounded-full",
        className
      )}
      onClick={() => setCollapsed(!collapsed)}
      {...props}
    >
      {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "sidebar-inset h-full bg-background transition-[margin]",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

export { SidebarProvider, SidebarTrigger, SidebarInset, SidebarContext }
