'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Check, Building2, MapPin, Users, FileText, Shield, Rocket } from 'lucide-react'
import { OrganizationStep } from './steps/organization-step'
import { LocationsStep } from './steps/locations-step'
import { TeamStep } from './steps/team-step'
import { TemplatesStep } from './steps/templates-step'
import { ComplianceStep } from './steps/compliance-step'
import { CompleteStep } from './steps/complete-step'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface OnboardingWizardProps {
  organization: {
    id: string
    name: string
    timezone: string
    nicheMode: string
  }
  locations: {
    id: string
    name: string
    address: string | null
    city: string | null
    state: string | null
    phone: string | null
  }[]
  users: {
    id: string
    name: string | null
    email: string
    role: string
  }[]
}

const STEPS = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'compliance', label: 'Compliance', icon: Shield },
  { id: 'complete', label: 'Complete', icon: Rocket },
]

export function OnboardingWizard({ organization, locations, users }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    organization: {
      name: organization.name,
      timezone: organization.timezone,
      nicheMode: organization.nicheMode,
    },
    locations: locations,
    invites: [] as { email: string; role: string }[],
    selectedPacks: [] as string[],
    compliancePreset: 'standard',
  })

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    try {
      // Save onboarding data
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to complete onboarding')
      }

      toast.success('Setup complete! Welcome to FuneralOps')
      router.push('/app/today')
    } catch {
      toast.error('Failed to complete setup. Please try again.')
    }
  }

  const updateFormData = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'organization':
        return (
          <OrganizationStep
            data={formData.organization}
            onChange={(data) => updateFormData('organization', data)}
          />
        )
      case 'locations':
        return (
          <LocationsStep
            locations={formData.locations}
            onChange={(locs) => updateFormData('locations', locs)}
          />
        )
      case 'team':
        return (
          <TeamStep
            existingUsers={users}
            invites={formData.invites}
            onChange={(invites) => updateFormData('invites', invites)}
          />
        )
      case 'templates':
        return (
          <TemplatesStep
            selectedPacks={formData.selectedPacks}
            onChange={(packs) => updateFormData('selectedPacks', packs)}
          />
        )
      case 'compliance':
        return (
          <ComplianceStep
            preset={formData.compliancePreset}
            onChange={(preset) => updateFormData('compliancePreset', preset)}
          />
        )
      case 'complete':
        return <CompleteStep formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isComplete = index < currentStep
            const isCurrent = index === currentStep
            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    isComplete
                      ? 'bg-[oklch(0.45_0.12_180)] text-white'
                      : isCurrent
                        ? 'bg-[oklch(0.45_0.12_180)]/10 text-[oklch(0.45_0.12_180)] ring-2 ring-[oklch(0.45_0.12_180)]'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isCurrent ? 'text-[oklch(0.45_0.12_180)]' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        {currentStep === STEPS.length - 1 ? (
          <Button onClick={handleComplete} className="bg-[oklch(0.45_0.12_180)]">
            Complete Setup
          </Button>
        ) : (
          <Button onClick={handleNext} className="bg-[oklch(0.45_0.12_180)]">
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}
