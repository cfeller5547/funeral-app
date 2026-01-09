'use client'

import { Check, Building2, MapPin, Users, FileText, Shield } from 'lucide-react'

interface CompleteStepProps {
  formData: {
    organization: {
      name: string
      timezone: string
      nicheMode: string
    }
    locations: { name: string }[]
    invites: { email: string }[]
    selectedPacks: string[]
    compliancePreset: string
  }
}

export function CompleteStep({ formData }: CompleteStepProps) {
  const summaryItems = [
    {
      icon: Building2,
      label: 'Organization',
      value: formData.organization.name,
    },
    {
      icon: MapPin,
      label: 'Locations',
      value: `${formData.locations.length} location${formData.locations.length !== 1 ? 's' : ''}`,
    },
    {
      icon: Users,
      label: 'Team Invites',
      value: formData.invites.length > 0
        ? `${formData.invites.length} pending invite${formData.invites.length !== 1 ? 's' : ''}`
        : 'None',
    },
    {
      icon: FileText,
      label: 'Template Packs',
      value: formData.selectedPacks.length > 0
        ? `${formData.selectedPacks.length} pack${formData.selectedPacks.length !== 1 ? 's' : ''} selected`
        : 'None selected',
    },
    {
      icon: Shield,
      label: 'Compliance',
      value: formData.compliancePreset.charAt(0).toUpperCase() + formData.compliancePreset.slice(1),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">You&apos;re All Set!</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review your setup and click Complete to get started
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">Setup Summary</h3>
        {summaryItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <Icon className="h-4 w-4 text-[oklch(0.45_0.12_180)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-[oklch(0.45_0.12_180)]/5 rounded-lg p-4">
        <h3 className="font-medium text-[oklch(0.35_0.08_180)] mb-2">What&apos;s Next?</h3>
        <ul className="text-sm text-[oklch(0.4_0.06_180)] space-y-2">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Create your first case
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Customize document templates
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Configure your price list
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Test the family portal
          </li>
        </ul>
      </div>
    </div>
  )
}
