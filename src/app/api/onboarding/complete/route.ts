import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organization, locations, invites, selectedPacks, compliancePreset } = body

    // Update organization
    await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: {
        name: organization.name,
        timezone: organization.timezone,
        nicheMode: organization.nicheMode,
        settings: {
          onboardingComplete: true,
          compliancePreset,
          selectedPacks,
        },
      },
    })

    // Update/create locations
    for (const location of locations) {
      if (location.id.startsWith('new-')) {
        // Create new location
        await prisma.location.create({
          data: {
            organizationId: session.user.organizationId,
            name: location.name,
            address: location.address,
            city: location.city,
            state: location.state,
            phone: location.phone,
          },
        })
      } else {
        // Update existing location
        await prisma.location.update({
          where: { id: location.id },
          data: {
            name: location.name,
            address: location.address,
            city: location.city,
            state: location.state,
            phone: location.phone,
          },
        })
      }
    }

    // Store invites in organization settings for later processing
    // In a production app, this would create invite records and send emails
    if (invites.length > 0) {
      await prisma.organization.update({
        where: { id: session.user.organizationId },
        data: {
          settings: {
            onboardingComplete: true,
            compliancePreset,
            selectedPacks,
            pendingInvites: invites,
          },
        },
      })
    }

    // Create compliance rules based on preset
    if (compliancePreset === 'standard' || compliancePreset === 'strict') {
      const standardRules = [
        {
          name: 'GPL Required Before Arrangement',
          description: 'General Price List must be provided before arrangement conference',
          conditionType: 'STAGE_GTE' as const,
          conditionValue: 'ARRANGEMENT',
          requirementType: 'DOCUMENT_EXISTS' as const,
          requirementTag: 'GPL' as const,
          severity: 'BLOCKER' as const,
        },
        {
          name: 'Cremation Authorization Required',
          description: 'Cremation authorization must be signed before cremation',
          conditionType: 'DISPOSITION_EQUALS' as const,
          conditionValue: 'CREMATION',
          requirementType: 'SIGNATURE_COMPLETED' as const,
          requirementTag: 'AUTHORIZATION_CREMATION' as const,
          severity: 'BLOCKER' as const,
        },
      ]

      for (const rule of standardRules) {
        await prisma.complianceRule.create({
          data: {
            organizationId: session.user.organizationId,
            ...rule,
          },
        })
      }
    }

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        eventType: 'ONBOARDING_COMPLETED',
        entityType: 'Organization',
        entityId: session.user.organizationId,
        description: 'Organization onboarding completed',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
