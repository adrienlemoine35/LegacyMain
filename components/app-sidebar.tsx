"use client"

import { Home, ChevronsRight, ArrowRightFromLine, ChevronRight, Package, Truck, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AppSidebar({ collapsed = true, onToggle }: AppSidebarProps) {
  const navItems = [
    { icon: Home, label: "Accueil", active: false },
    { icon: Package, label: "Produits", active: true },
    { icon: Truck, label: "Fournisseurs", active: false },
    { icon: BarChart3, label: "Rapports", active: false },
    { icon: ArrowRightFromLine, label: "Export", active: false },
  ]

  return (
    <aside
      className={cn(
        "sticky left-0 top-0 z-40 flex h-screen flex-col bg-sidebar shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Toggle button */}
      <div className="flex h-14 items-center justify-center border-b border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex size-10 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ChevronsRight className={cn("size-5 transition-transform", !collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  item.active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="size-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.active && (
                  <ChevronRight className="ml-auto size-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User avatar placeholder */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-foreground">
            U
          </div>
          {!collapsed && (
            <div className="truncate text-sm text-sidebar-foreground/70">Utilisateur</div>
          )}
        </div>
      </div>
    </aside>
  )
}
