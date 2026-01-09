'use client'

import { PortalFormWrapper } from '../portal-form-wrapper'
import { PortalField } from '../portal-field'

interface AboutStepProps {
  token: string
  initialData: Record<string, unknown>
}

export function AboutStep({ token, initialData }: AboutStepProps) {
  const handleSave = async (data: Record<string, unknown>) => {
    await fetch(`/api/portal/${token}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'about', data }),
    })
  }

  return (
    <PortalFormWrapper
      token={token}
      stepId="about"
      title="About Your Loved One"
      description="Please provide biographical information. This helps us prepare the necessary documents."
      prevStep=""
      nextStep="/obituary"
      onSave={handleSave}
      initialData={initialData}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField
          name="firstName"
          label="First Name"
          placeholder="Enter first name"
          required
        />
        <PortalField
          name="middleName"
          label="Middle Name"
          placeholder="Enter middle name"
        />
        <PortalField
          name="lastName"
          label="Last Name"
          placeholder="Enter last name"
          required
        />
        <PortalField
          name="maidenName"
          label="Maiden Name"
          placeholder="If applicable"
        />
        <PortalField
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          required
        />
        <PortalField
          name="dateOfDeath"
          label="Date of Passing"
          type="date"
          required
        />
        <PortalField
          name="placeOfBirth"
          label="Place of Birth"
          placeholder="City, State"
        />
        <PortalField
          name="placeOfDeath"
          label="Place of Passing"
          placeholder="City, State"
        />
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <PortalField
            name="occupation"
            label="Occupation"
            placeholder="Primary occupation"
          />
          <PortalField
            name="education"
            label="Education"
            placeholder="Highest level of education"
          />
          <PortalField
            name="militaryService"
            label="Military Service"
            placeholder="Branch and years of service"
          />
          <PortalField
            name="religion"
            label="Religious Affiliation"
            placeholder="If applicable"
          />
        </div>
      </div>
    </PortalFormWrapper>
  )
}
