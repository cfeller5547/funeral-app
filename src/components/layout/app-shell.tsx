'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { UserRole } from '@prisma/client'

interface AppShellProps {
  children: React.ReactNode
  locations?: { id: string; name: string }[]
}

const ADMIN_ROLES: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER']

export function AppShell({ children, locations = [] }: AppShellProps) {
  const { data: session } = useSession()
  const [currentLocationId, setCurrentLocationId] = useState<string>('')

  const isAdmin = session?.user?.role && ADMIN_ROLES.includes(session.user.role as UserRole)

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            locations={locations}
            currentLocationId={currentLocationId}
            onLocationChange={setCurrentLocationId}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
