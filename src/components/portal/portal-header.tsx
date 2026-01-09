'use client'

import { Heart } from 'lucide-react'

interface PortalHeaderProps {
  organizationName: string
  decedentName: string
}

export function PortalHeader({ organizationName, decedentName }: PortalHeaderProps) {
  return (
    <header className="bg-white border-b border-amber-200/50 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Heart className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{organizationName}</p>
              <p className="font-medium text-gray-900">In Memory of {decedentName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
