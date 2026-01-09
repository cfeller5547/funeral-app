'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Search, ChevronDown, LogOut, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CommandMenu } from './command-menu'

interface TopBarProps {
  locations?: { id: string; name: string }[]
  currentLocationId?: string
  onLocationChange?: (locationId: string) => void
}

export function TopBar({ locations = [], currentLocationId, onLocationChange }: TopBarProps) {
  const { data: session } = useSession()
  const [commandOpen, setCommandOpen] = useState(false)

  const currentLocation = locations.find((l) => l.id === currentLocationId)
  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
        {/* Left: Location Switcher */}
        <div className="flex items-center gap-4">
          {locations.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLocation?.name || 'All Locations'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Switch Location</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onLocationChange?.('')}>
                  All Locations
                </DropdownMenuItem>
                {locations.map((location) => (
                  <DropdownMenuItem
                    key={location.id}
                    onClick={() => onLocationChange?.(location.id)}
                  >
                    {location.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center px-4">
          <Button
            variant="outline"
            className="w-full max-w-md justify-start text-muted-foreground"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Search cases, contacts, docs...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right: Notifications & User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium lg:inline">
                  {session?.user?.name || 'User'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session?.user?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {session?.user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
