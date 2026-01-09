'use client'

import { PortalFormWrapper } from '../portal-form-wrapper'
import { PortalField } from '../portal-field'

interface ObituaryStepProps {
  token: string
  initialData: Record<string, unknown>
}

export function ObituaryStep({ token, initialData }: ObituaryStepProps) {
  const handleSave = async (data: Record<string, unknown>) => {
    await fetch(`/api/portal/${token}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'obituary', data }),
    })
  }

  return (
    <PortalFormWrapper
      token={token}
      stepId="obituary"
      title="Obituary Information"
      description="Help us tell the story of your loved one's life."
      prevStep="/about"
      nextStep="/participants"
      onSave={handleSave}
      initialData={initialData}
    >
      <div className="space-y-4">
        <PortalField
          name="lifeStory"
          label="Life Story"
          type="textarea"
          placeholder="Share memories, accomplishments, and the essence of who they were..."
        />

        <PortalField
          name="hobbies"
          label="Hobbies & Interests"
          type="textarea"
          placeholder="What activities brought them joy? What were they passionate about?"
        />

        <PortalField
          name="survivors"
          label="Surviving Family Members"
          type="textarea"
          placeholder="List family members (e.g., spouse, children, grandchildren, siblings...)"
        />

        <PortalField
          name="predeceased"
          label="Predeceased By"
          type="textarea"
          placeholder="List family members who passed before them..."
        />

        <PortalField
          name="specialMessage"
          label="Special Message or Quote"
          type="textarea"
          placeholder="A favorite saying, scripture, or message for those who knew them..."
        />

        <PortalField
          name="charityInLieu"
          label="Memorial Donations"
          placeholder="Organization name for memorial donations, if desired"
        />
      </div>
    </PortalFormWrapper>
  )
}
