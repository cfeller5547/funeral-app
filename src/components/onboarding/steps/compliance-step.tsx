'use client'

import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, Check } from 'lucide-react'

interface ComplianceStepProps {
  preset: string
  onChange: (preset: string) => void
}

const COMPLIANCE_PRESETS = [
  {
    id: 'standard',
    name: 'Standard Compliance',
    description: 'FTC Funeral Rule requirements and common state regulations',
    rules: [
      'GPL must be provided before arrangement',
      'Written authorization required for cremation',
      'Death certificate before disposition',
    ],
    recommended: true,
  },
  {
    id: 'strict',
    name: 'Strict Compliance',
    description: 'Enhanced requirements for high-compliance states',
    rules: [
      'All Standard rules plus:',
      'Cooling period before cremation',
      'Two-witness signature requirements',
      'Detailed itemized statements',
    ],
    recommended: false,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Basic FTC requirements only - customize rules later',
    rules: ['GPL disclosure', 'Basic authorization forms'],
    recommended: false,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Start with no rules and configure your own',
    rules: ['Configure your own compliance rules after setup'],
    recommended: false,
  },
]

export function ComplianceStep({ preset, onChange }: ComplianceStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Compliance Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a compliance preset to help ensure regulatory requirements are met
        </p>
      </div>

      <div className="bg-amber-50 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-900">Important Note</p>
          <p className="text-amber-800">
            Compliance rules help prevent cases from advancing without required documents.
            Check with your state regulations to ensure proper configuration.
          </p>
        </div>
      </div>

      <RadioGroup value={preset} onValueChange={onChange}>
        <div className="space-y-3">
          {COMPLIANCE_PRESETS.map((option) => {
            const isSelected = preset === option.id
            return (
              <Card
                key={option.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-[oklch(0.45_0.12_180)] bg-[oklch(0.45_0.12_180)]/5'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onChange(option.id)}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[oklch(0.45_0.12_180)]" />
                      <Label htmlFor={option.id} className="font-medium text-gray-900 cursor-pointer">
                        {option.name}
                      </Label>
                      {option.recommended && (
                        <Badge className="bg-[oklch(0.45_0.12_180)]">Recommended</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    <ul className="mt-2 space-y-1">
                      {option.rules.map((rule, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <Check className="h-3 w-3 text-[oklch(0.45_0.12_180)]" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </RadioGroup>

      <p className="text-sm text-gray-500">
        You can add, remove, or modify compliance rules at any time in Settings.
      </p>
    </div>
  )
}
