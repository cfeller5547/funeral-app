'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'

const navItems = [
  {
    title: 'Today',
    href: '/app/today',
    icon: LayoutDashboard,
  },
  {
    title: 'Cases',
    href: '/app/cases',
    icon: Briefcase,
  },
  {
    title: 'Documents',
    href: '/app/documents',
    icon: FileText,
  },
  {
    title: 'Families',
    href: '/app/families',
    icon: Users,
  },
  {
    title: 'Compliance',
    href: '/app/compliance',
    icon: Shield,
  },
]

const adminItems = [
  {
    title: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  isAdmin?: boolean
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/app/today') {
      return pathname === '/app/today' || pathname === '/app'
    }
    return pathname.startsWith(href)
  }

  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/app/today" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
              F
            </div>
            <span className="text-lg font-semibold text-foreground">FuneralOps</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/app/today" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
              F
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {allItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-10 w-full items-center justify-center rounded-lg transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
