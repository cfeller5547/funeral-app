'use client'

import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { FileText, Check } from 'lucide-react'

interface TemplatesStepProps {
  selectedPacks: string[]
  onChange: (packs: string[]) => void
}

const TEMPLATE_PACKS = [
  {
    id: 'standard',
    name: 'Standard Package',
    description: 'Essential documents for traditional funeral services',
    documents: ['Contract', 'GPL', 'Authorization Forms', 'Death Certificate Application'],
    recommended: true,
  },
  {
    id: 'cremation',
    name: 'Cremation Package',
    description: 'Documents specific to cremation services',
    documents: ['Cremation Authorization', 'Urn Selection Form', 'Scatter Authorization'],
    recommended: false,
  },
  {
    id: 'preneed',
    name: 'Pre-Need Package',
    description: 'Documents for advance planning services',
    documents: ['Pre-Need Contract', 'Payment Plan Agreement', 'Wishes Documentation'],
    recommended: false,
  },
  {
    id: 'veterans',
    name: 'Veterans Package',
    description: 'Forms for military honors and VA benefits',
    documents: ['DD-214 Request', 'VA Benefits Application', 'Military Honors Request'],
    recommended: false,
  },
]

export function TemplatesStep({ selectedPacks, onChange }: TemplatesStepProps) {
  const togglePack = (packId: string) => {
    if (selectedPacks.includes(packId)) {
      onChange(selectedPacks.filter((p) => p !== packId))
    } else {
      onChange([...selectedPacks, packId])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Document Templates</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select the template packs you&apos;d like to start with. You can customize these later.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATE_PACKS.map((pack) => {
          const isSelected = selectedPacks.includes(pack.id)
          return (
            <Card
              key={pack.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-[oklch(0.45_0.12_180)] bg-[oklch(0.45_0.12_180)]/5'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => togglePack(pack.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => togglePack(pack.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[oklch(0.45_0.12_180)]" />
                    <span className="font-medium text-gray-900">{pack.name}</span>
                    {pack.recommended && (
                      <Badge className="bg-[oklch(0.45_0.12_180)]">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{pack.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pack.documents.map((doc) => (
                      <Badge key={doc} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 text-[oklch(0.45_0.12_180)]" />
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <p className="text-sm text-gray-500">
        Don&apos;t worry - you can upload your own templates or modify these at any time.
      </p>
    </div>
  )
}
