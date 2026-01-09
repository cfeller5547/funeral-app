'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface PortalProgressProps {
  token: string
  currentStatus: string
  progress: Record<string, boolean>
}

const STEPS = [
  { id: 'welcome', label: 'Welcome', path: '' },
  { id: 'about', label: 'About', path: '/about' },
  { id: 'obituary', label: 'Obituary', path: '/obituary' },
  { id: 'participants', label: 'Participants', path: '/participants' },
  { id: 'uploads', label: 'Uploads', path: '/uploads' },
  { id: 'review', label: 'Review', path: '/review' },
  { id: 'sign', label: 'Sign', path: '/sign' },
  { id: 'confirmation', label: 'Done', path: '/confirmation' },
]

export function PortalProgress({ token, progress: progressData }: PortalProgressProps) {
  // Extract steps completed from progress
  const progress = (progressData as Record<string, unknown>)?._stepsCompleted as Record<string, boolean> || {}
  const pathname = usePathname()
  const basePath = `/f/${token}`

  const getCurrentStepIndex = () => {
    const currentPath = pathname.replace(basePath, '') || ''
    return STEPS.findIndex((step) => step.path === currentPath)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="bg-white rounded-xl border border-amber-200/50 p-4 shadow-sm">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = progress[step.id] === true
            const isCurrent = index === currentStepIndex
            const isAccessible = index <= currentStepIndex || isCompleted || index === currentStepIndex + 1

            return (
              <li key={step.id} className="flex-1 relative">
                {index > 0 && (
                  <div
                    className={cn(
                      'absolute left-0 top-4 -translate-x-1/2 w-full h-0.5',
                      isCompleted || index <= currentStepIndex
                        ? 'bg-amber-500'
                        : 'bg-gray-200'
                    )}
                    style={{ width: 'calc(100% - 2rem)', left: '1rem' }}
                  />
                )}
                <div className="relative flex flex-col items-center group">
                  {isAccessible ? (
                    <Link
                      href={`${basePath}${step.path}`}
                      className="flex flex-col items-center"
                    >
                      <span
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                          'min-h-[44px] min-w-[44px]', // Large touch target
                          isCompleted
                            ? 'bg-amber-500 text-white'
                            : isCurrent
                              ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span
                        className={cn(
                          'mt-2 text-xs font-medium hidden sm:block',
                          isCurrent ? 'text-amber-700' : 'text-gray-500'
                        )}
                      >
                        {step.label}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex flex-col items-center cursor-not-allowed">
                      <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-100 text-gray-400 min-h-[44px] min-w-[44px]">
                        {index + 1}
                      </span>
                      <span className="mt-2 text-xs font-medium text-gray-400 hidden sm:block">
                        {step.label}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
