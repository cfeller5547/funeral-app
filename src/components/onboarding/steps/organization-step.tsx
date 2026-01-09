'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface OrganizationData {
  name: string
  timezone: string
  nicheMode: string
}

interface OrganizationStepProps {
  data: OrganizationData
  onChange: (data: OrganizationData) => void
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (no DST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
]

const NICHE_MODES = [
  { value: 'GENERAL', label: 'General - Full-service funeral home' },
  { value: 'CREMATION_FIRST', label: 'Cremation First - Cremation-focused services' },
  { value: 'MULTI_LOCATION', label: 'Multi-Location - Multiple locations' },
  { value: 'REMOVAL_HEAVY', label: 'Removal Heavy - Transport-focused services' },
]

export function OrganizationStep({ data, onChange }: OrganizationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Organization Details</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tell us about your funeral home
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Funeral Home Name</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="e.g., Serenity Funeral Home"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Time Zone</Label>
          <Select
            value={data.timezone}
            onValueChange={(value) => onChange({ ...data, timezone: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nicheMode">Service Focus</Label>
          <Select
            value={data.nicheMode}
            onValueChange={(value) => onChange({ ...data, nicheMode: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your focus" />
            </SelectTrigger>
            <SelectContent>
              {NICHE_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            This helps us customize templates and workflows for your needs
          </p>
        </div>
      </div>
    </div>
  )
}
