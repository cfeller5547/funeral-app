'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Briefcase,
  FileText,
  Users,
  Plus,
  LayoutDashboard,
  Shield,
  Settings,
} from 'lucide-react'

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const runCommand = (command: () => void) => {
    onOpenChange(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type to search cases, contacts, documents..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push('/app/cases/new'))}>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/app/today'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Today Board
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/app/cases'))}>
            <Briefcase className="mr-2 h-4 w-4" />
            Cases
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/app/documents'))}>
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/app/families'))}>
            <Users className="mr-2 h-4 w-4" />
            Families
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/app/compliance'))}>
            <Shield className="mr-2 h-4 w-4" />
            Compliance
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/app/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Cases">
          <CommandItem onSelect={() => runCommand(() => router.push('/app/cases'))}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span className="text-muted-foreground">Search for cases...</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
