"use client"

import * as React from "react"
import { useContext } from "react"
import { cn } from "../lib/utils"
import { SidebarContext } from "./ui/sidebar"
import { HomeIcon, Settings, FileText, Users } from "lucide-react"
import { Link } from "react-router-dom"

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className, ...props }: AppSidebarProps) {
  const { collapsed } = useContext(SidebarContext)

  return (
    <div
      className={cn(
        "sidebar-wrapper group flex h-full flex-col border-r bg-muted/40 transition-all",
        collapsed ? "w-[60px]" : "w-[240px]",
        className
      )}
      {...props}
    >
      <div className="sidebar-header flex h-16 items-center border-b px-4 transition-all group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className={cn("flex items-center gap-2 text-lg font-semibold transition-all", 
                           collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100")}>
          <span className="h-6 w-6">📝</span>
          <span>Notes App</span>
        </div>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <div className="px-3 py-2">
          <h2 className={cn("mb-2 text-xs font-semibold text-muted-foreground transition-all",
                          collapsed ? "text-center w-full px-0" : "px-4")}>
            {collapsed ? "Menu" : "Navigation"}
          </h2>
          <div className="space-y-1">
            <SidebarItem icon={<HomeIcon className="h-4 w-4" />} href="/dashboard">
              Dashboard
            </SidebarItem>
            <SidebarItem icon={<FileText className="h-4 w-4" />} href="/notes">
              Notes
            </SidebarItem>
            <SidebarItem icon={<Users className="h-4 w-4" />} href="/shared">
              Shared
            </SidebarItem>
            <SidebarItem icon={<Settings className="h-4 w-4" />} href="/settings">
              Settings
            </SidebarItem>
          </div>
        </div>
      </nav>
      <div className="sidebar-footer mt-auto border-t p-4">
        <div className={cn("flex items-center justify-between", 
                         collapsed ? "flex-col gap-2" : "flex-row gap-4")}>
          <div className={cn("flex items-center gap-2 text-sm", 
                           collapsed ? "flex-col" : "flex-row")}>
            <div className="h-8 w-8 rounded-full bg-muted" />
            {!collapsed && <div>User</div>}
          </div>
          {!collapsed && <div className="text-xs text-muted-foreground">v1.0.0</div>}
        </div>
      </div>
    </div>
  )
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  icon?: React.ReactNode
  href: string
}

function SidebarItem({ icon, href, children, className, ...props }: SidebarItemProps) {
  const { collapsed } = useContext(SidebarContext)
  
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {icon}
      <span className={cn(collapsed ? "w-0 h-0 overflow-hidden" : "block")}>
        {children}
      </span>
    </Link>
  )
}
