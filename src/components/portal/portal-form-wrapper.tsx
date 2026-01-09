'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PortalFormWrapperProps {
  token: string
  stepId: string
  title: string
  description?: string
  prevStep?: string
  nextStep: string
  children: React.ReactNode
  onSave: (data: Record<string, unknown>) => Promise<void>
  initialData?: Record<string, unknown>
}

export function PortalFormWrapper({
  token,
  stepId,
  title,
  description,
  prevStep,
  nextStep,
  children,
  onSave,
  initialData = {},
}: PortalFormWrapperProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
  const [hasChanges, setHasChanges] = useState(false)

  // Autosave after 2 seconds of inactivity
  useEffect(() => {
    if (!hasChanges) return

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          await onSave(formData)
          setHasChanges(false)
        } catch {
          // Silent fail for autosave
        }
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData, hasChanges, onSave])

  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }, [])

  const handleContinue = async () => {
    startTransition(async () => {
      try {
        await onSave(formData)
        // Update progress
        await fetch(`/api/portal/${token}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepId, completed: true }),
        })
        router.push(`/f/${token}${nextStep}`)
      } catch {
        toast.error('Failed to save. Please try again.')
      }
    })
  }

  return (
    <Card className="border-amber-200/50">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <PortalFormContext.Provider value={{ formData, updateField }}>
          {children}
        </PortalFormContext.Provider>

        <div className="flex items-center justify-between pt-4 border-t">
          {prevStep ? (
            <Button
              variant="ghost"
              asChild
              className="min-h-[44px]"
            >
              <Link href={`/f/${token}${prevStep}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-gray-500">
                {isPending ? 'Saving...' : 'Unsaved changes'}
              </span>
            )}
            <Button
              onClick={handleContinue}
              disabled={isPending}
              className="min-h-[44px] bg-amber-600 hover:bg-amber-700"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Context for form fields
import { createContext, useContext } from 'react'

interface PortalFormContextValue {
  formData: Record<string, unknown>
  updateField: (field: string, value: unknown) => void
}

const PortalFormContext = createContext<PortalFormContextValue | null>(null)

export function usePortalForm() {
  const ctx = useContext(PortalFormContext)
  if (!ctx) {
    throw new Error('usePortalForm must be used within PortalFormWrapper')
  }
  return ctx
}
