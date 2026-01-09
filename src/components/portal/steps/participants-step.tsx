'use client'

import { PortalFormWrapper } from '../portal-form-wrapper'
import { PortalField } from '../portal-field'

interface ParticipantsStepProps {
  token: string
  initialData: Record<string, unknown>
}

export function ParticipantsStep({ token, initialData }: ParticipantsStepProps) {
  const handleSave = async (data: Record<string, unknown>) => {
    await fetch(`/api/portal/${token}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'participants', data }),
    })
  }

  return (
    <PortalFormWrapper
      token={token}
      stepId="participants"
      title="Service Participants"
      description="Let us know who will be participating in the service."
      prevStep="/obituary"
      nextStep="/uploads"
      onSave={handleSave}
      initialData={initialData}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Pallbearers</h3>
          <PortalField
            name="pallbearers"
            label="Active Pallbearers"
            type="textarea"
            placeholder="List names of pallbearers (one per line)"
          />
          <PortalField
            name="honoraryPallbearers"
            label="Honorary Pallbearers"
            type="textarea"
            placeholder="List names of honorary pallbearers (one per line)"
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900">Service Participants</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <PortalField
              name="officiant"
              label="Officiant / Clergy"
              placeholder="Name of officiant"
            />
            <PortalField
              name="musicianSinger"
              label="Musician / Singer"
              placeholder="Name of performer"
            />
            <PortalField
              name="eulogist"
              label="Person Giving Eulogy"
              placeholder="Name"
            />
            <PortalField
              name="readers"
              label="Scripture / Poem Readers"
              placeholder="Names of readers"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900">Music Selections</h3>
          <PortalField
            name="musicSelections"
            label="Requested Songs"
            type="textarea"
            placeholder="List any specific songs or hymns requested for the service..."
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900">Additional Notes</h3>
          <PortalField
            name="serviceNotes"
            label="Special Requests or Notes"
            type="textarea"
            placeholder="Any special requests, traditions, or cultural considerations..."
          />
        </div>
      </div>
    </PortalFormWrapper>
  )
}
