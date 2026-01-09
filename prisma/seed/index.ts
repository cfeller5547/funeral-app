import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data (in reverse order of dependencies)
  await prisma.auditEvent.deleteMany()
  await prisma.blocker.deleteMany()
  await prisma.complianceRule.deleteMany()
  await prisma.signatureRequestSigner.deleteMany()
  await prisma.signatureRequest.deleteMany()
  await prisma.document.deleteMany()
  await prisma.taskTemplate.deleteMany()
  await prisma.templatePackItem.deleteMany()
  await prisma.templatePack.deleteMany()
  await prisma.documentTemplate.deleteMany()
  await prisma.task.deleteMany()
  await prisma.caseContact.deleteMany()
  await prisma.familyPortalSession.deleteMany()
  await prisma.case.deleteMany()
  await prisma.person.deleteMany()
  await prisma.priceListItem.deleteMany()
  await prisma.priceList.deleteMany()
  await prisma.inboundEmail.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.userLocation.deleteMany()
  await prisma.user.deleteMany()
  await prisma.location.deleteMany()
  await prisma.organization.deleteMany()

  console.log('✓ Cleaned existing data')

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Serenity Funeral Home',
      slug: 'serenity-demo',
      timezone: 'America/New_York',
      nicheMode: 'GENERAL',
      settings: {
        demoMode: true,
      },
    },
  })

  console.log('✓ Created organization:', org.name)

  // Create locations
  const mainLocation = await prisma.location.create({
    data: {
      organizationId: org.id,
      name: 'Main Chapel',
      address: '123 Memorial Drive',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      phone: '(555) 123-4567',
      isDefault: true,
    },
  })

  const westLocation = await prisma.location.create({
    data: {
      organizationId: org.id,
      name: 'West Side Chapel',
      address: '456 Sunset Blvd',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      phone: '(555) 987-6543',
      isDefault: false,
    },
  })

  console.log('✓ Created locations')

  // Create users
  const passwordHash = await bcrypt.hash('demo123', 12)

  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@demo.funeralops.com',
      name: 'Sarah Johnson',
      passwordHash,
      role: 'OWNER',
      isActive: true,
    },
  })

  const directorUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'director@demo.funeralops.com',
      name: 'Michael Chen',
      passwordHash,
      role: 'DIRECTOR',
      isActive: true,
    },
  })

  const staffUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'staff@demo.funeralops.com',
      name: 'Emily Rodriguez',
      passwordHash,
      role: 'STAFF',
      isActive: true,
    },
  })

  // Assign users to locations
  await prisma.userLocation.createMany({
    data: [
      { userId: adminUser.id, locationId: mainLocation.id },
      { userId: adminUser.id, locationId: westLocation.id },
      { userId: directorUser.id, locationId: mainLocation.id },
      { userId: staffUser.id, locationId: mainLocation.id },
    ],
  })

  console.log('✓ Created users')

  // Create document templates
  const gplTemplate = await prisma.documentTemplate.create({
    data: {
      organizationId: org.id,
      name: 'General Price List',
      description: 'Standard GPL document with all pricing',
      tag: 'GPL',
      content: `
GENERAL PRICE LIST

Effective Date: {{organization.effectiveDate}}

{{organization.name}}
{{organization.address}}
{{organization.phone}}

SERVICES AND PRICING

Professional Services:
- Basic Services of Funeral Director and Staff: $2,495
- Embalming: $895
- Other Preparation of Body: $295
- Use of Facilities and Staff for Viewing: $495
- Use of Facilities and Staff for Funeral Ceremony: $595
- Use of Facilities and Staff for Memorial Service: $495
- Use of Equipment and Staff for Graveside Service: $395
- Hearse: $395
- Funeral Coach/Sedan: $195

CASKETS: A complete price list will be provided at the funeral home.
Range: $1,095 - $12,500

OUTER BURIAL CONTAINERS: A complete price list will be provided at the funeral home.
Range: $895 - $5,500

This General Price List is provided for informational purposes as required by the FTC Funeral Rule.
      `.trim(),
      signatureFields: JSON.stringify([]),
      isActive: true,
      version: 1,
    },
  })

  const cremationAuthTemplate = await prisma.documentTemplate.create({
    data: {
      organizationId: org.id,
      name: 'Cremation Authorization',
      description: 'Authorization for cremation services',
      tag: 'AUTHORIZATION_CREMATION',
      content: `
CREMATION AUTHORIZATION FORM

Case #: {{case.caseNumber}}
Date: {{currentDate}}

DECEDENT INFORMATION
Name: {{decedent.fullName}}
Date of Birth: {{decedent.dateOfBirth}}
Date of Death: {{decedent.dateOfDeath}}
Place of Death: {{decedent.placeOfDeath}}

AUTHORIZATION

I, the undersigned, being the {{authorizer.relationship}} of the above-named decedent, hereby authorize {{organization.name}} to cremate the remains of the decedent.

I understand that cremation is an irreversible process and that the remains cannot be identified by visual means after cremation.

I represent that I have the legal authority to authorize this cremation and that there are no objections from any other persons with equal or superior rights.

DISPOSITION OF CREMATED REMAINS
The cremated remains are to be:
[ ] Returned to the family
[ ] Scattered at: _________________________
[ ] Placed in columbarium/cemetery: _________________________

Signature: _________________________
Printed Name: _________________________
Relationship: _________________________
Date: _________________________
      `.trim(),
      signatureFields: JSON.stringify([
        { id: 'authorizer', label: 'Authorizing Party', required: true },
      ]),
      isActive: true,
      version: 1,
    },
  })

  const contractTemplate = await prisma.documentTemplate.create({
    data: {
      organizationId: org.id,
      name: 'Funeral Service Contract',
      description: 'Main service contract and itemization',
      tag: 'CONTRACT',
      content: `
FUNERAL SERVICE CONTRACT

{{organization.name}}
{{organization.address}}
{{organization.phone}}

Contract Date: {{currentDate}}
Case Number: {{case.caseNumber}}

DECEDENT
Name: {{decedent.fullName}}
Date of Death: {{decedent.dateOfDeath}}

PURCHASER/RESPONSIBLE PARTY
Name: {{purchaser.fullName}}
Address: {{purchaser.address}}
Phone: {{purchaser.phone}}
Email: {{purchaser.email}}

SERVICE DETAILS
Service Type: {{case.serviceType}}
Service Date: {{case.serviceDate}}
Service Time: {{case.serviceTime}}
Location: {{case.serviceLocation}}

ITEMIZED CHARGES
[Service items will be listed here]

TOTAL: $_________

TERMS AND CONDITIONS
1. A deposit of 50% is required to confirm services.
2. Full payment is due before the service date.
3. Prices are subject to change if services are modified.

By signing below, I agree to the terms and authorize the services listed above.

Purchaser Signature: _________________________
Date: _________________________
      `.trim(),
      signatureFields: JSON.stringify([
        { id: 'purchaser', label: 'Purchaser', required: true },
      ]),
      isActive: true,
      version: 1,
    },
  })

  console.log('✓ Created document templates')

  // Create template packs
  const arrangementPack = await prisma.templatePack.create({
    data: {
      organizationId: org.id,
      name: 'Arrangement Packet',
      description: 'Standard documents for funeral arrangement',
      isDefault: true,
    },
  })

  await prisma.templatePackItem.createMany({
    data: [
      { packId: arrangementPack.id, templateId: gplTemplate.id, order: 1, isRequired: true },
      { packId: arrangementPack.id, templateId: contractTemplate.id, order: 2, isRequired: true },
    ],
  })

  const cremationPack = await prisma.templatePack.create({
    data: {
      organizationId: org.id,
      name: 'Cremation Packet',
      description: 'Documents required for cremation cases',
      isDefault: false,
    },
  })

  await prisma.templatePackItem.createMany({
    data: [
      { packId: cremationPack.id, templateId: gplTemplate.id, order: 1, isRequired: true },
      { packId: cremationPack.id, templateId: cremationAuthTemplate.id, order: 2, isRequired: true },
      { packId: cremationPack.id, templateId: contractTemplate.id, order: 3, isRequired: true },
    ],
  })

  console.log('✓ Created template packs')

  // Create compliance rules
  const rules = await prisma.complianceRule.createMany({
    data: [
      {
        organizationId: org.id,
        name: 'GPL Required Before Arrangement',
        description: 'General Price List must be provided before arrangement conference',
        conditionType: 'STAGE_GTE',
        conditionValue: 'ARRANGEMENT',
        requirementType: 'DOCUMENT_EXISTS',
        requirementTag: 'GPL',
        requiresSigned: false,
        severity: 'BLOCKER',
        isActive: true,
      },
      {
        organizationId: org.id,
        name: 'Cremation Authorization Required',
        description: 'Signed cremation authorization required for cremation cases',
        conditionType: 'DISPOSITION_EQUALS',
        conditionValue: 'CREMATION',
        requirementType: 'DOCUMENT_SIGNED',
        requirementTag: 'AUTHORIZATION_CREMATION',
        requiresSigned: true,
        severity: 'BLOCKER',
        isActive: true,
      },
      {
        organizationId: org.id,
        name: 'Contract Required Before Service',
        description: 'Signed contract required before service date',
        conditionType: 'STAGE_GTE',
        conditionValue: 'SERVICE',
        requirementType: 'DOCUMENT_SIGNED',
        requirementTag: 'CONTRACT',
        requiresSigned: true,
        severity: 'BLOCKER',
        isActive: true,
      },
    ],
  })

  console.log('✓ Created compliance rules')

  // Create demo cases
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  // Case 1: Active case in Documents stage
  const decedent1 = await prisma.person.create({
    data: {
      firstName: 'Robert',
      middleName: 'James',
      lastName: 'Thompson',
      suffix: 'Sr.',
      dateOfBirth: new Date('1945-03-15'),
      dateOfDeath: lastWeek,
      placeOfDeath: 'Springfield General Hospital',
      address: '789 Oak Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
    },
  })

  const case1 = await prisma.case.create({
    data: {
      caseNumber: `${today.getFullYear().toString().slice(-2)}0001`,
      organizationId: org.id,
      locationId: mainLocation.id,
      directorId: directorUser.id,
      status: 'ACTIVE',
      stage: 'DOCUMENTS',
      serviceType: 'TRADITIONAL',
      disposition: 'BURIAL',
      serviceDate: nextWeek,
      serviceTime: '10:00 AM',
      serviceLocation: 'Main Chapel',
      notes: 'Traditional service with viewing. Family has requested specific hymns.',
      decedentId: decedent1.id,
    },
  })

  // Add contact for case 1
  const contact1 = await prisma.person.create({
    data: {
      firstName: 'Mary',
      lastName: 'Thompson',
      phone: '(555) 234-5678',
      email: 'mary.thompson@email.com',
    },
  })

  await prisma.caseContact.create({
    data: {
      caseId: case1.id,
      personId: contact1.id,
      role: 'NEXT_OF_KIN',
      isPrimary: true,
    },
  })

  // Add tasks for case 1
  await prisma.task.createMany({
    data: [
      {
        caseId: case1.id,
        title: 'Confirm flower arrangements',
        status: 'OPEN',
        priority: 'MEDIUM',
        dueDate: tomorrow,
        assigneeId: staffUser.id,
        createdById: directorUser.id,
        stage: 'SERVICE',
      },
      {
        caseId: case1.id,
        title: 'Coordinate with cemetery',
        status: 'DONE',
        priority: 'HIGH',
        completedAt: new Date(),
        assigneeId: directorUser.id,
        createdById: directorUser.id,
        stage: 'DISPOSITION',
      },
    ],
  })

  // Case 2: Cremation case with blocker
  const decedent2 = await prisma.person.create({
    data: {
      firstName: 'Helen',
      lastName: 'Martinez',
      dateOfBirth: new Date('1938-07-22'),
      dateOfDeath: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      placeOfDeath: 'Home',
      city: 'Springfield',
      state: 'IL',
    },
  })

  const case2 = await prisma.case.create({
    data: {
      caseNumber: `${today.getFullYear().toString().slice(-2)}0002`,
      organizationId: org.id,
      locationId: mainLocation.id,
      directorId: directorUser.id,
      status: 'ACTIVE',
      stage: 'SIGNATURES',
      serviceType: 'MEMORIAL',
      disposition: 'CREMATION',
      serviceDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      serviceTime: '2:00 PM',
      notes: 'Memorial service after cremation. Family requests intimate gathering.',
      decedentId: decedent2.id,
    },
  })

  // Create blocker for case 2 (missing cremation auth)
  const cremationRule = await prisma.complianceRule.findFirst({
    where: {
      organizationId: org.id,
      name: 'Cremation Authorization Required',
    },
  })

  if (cremationRule) {
    await prisma.blocker.create({
      data: {
        caseId: case2.id,
        ruleId: cremationRule.id,
        message: 'Cremation authorization document is not signed',
        fixAction: 'Generate and request signature on cremation authorization',
        fixUrl: `/app/cases/${case2.id}?tab=signatures`,
        isResolved: false,
      },
    })
  }

  // Case 3: Service today
  const decedent3 = await prisma.person.create({
    data: {
      firstName: 'William',
      lastName: 'Anderson',
      dateOfBirth: new Date('1952-11-08'),
      dateOfDeath: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      placeOfDeath: 'Sunset Nursing Home',
    },
  })

  const case3 = await prisma.case.create({
    data: {
      caseNumber: `${today.getFullYear().toString().slice(-2)}0003`,
      organizationId: org.id,
      locationId: westLocation.id,
      directorId: adminUser.id,
      status: 'ACTIVE',
      stage: 'SERVICE',
      serviceType: 'GRAVESIDE',
      disposition: 'BURIAL',
      serviceDate: today,
      serviceTime: '11:00 AM',
      serviceLocation: 'Evergreen Cemetery',
      decedentId: decedent3.id,
    },
  })

  // Case 4: Recently closed case
  const decedent4 = await prisma.person.create({
    data: {
      firstName: 'Dorothy',
      lastName: 'Wilson',
      dateOfBirth: new Date('1935-04-12'),
      dateOfDeath: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.case.create({
    data: {
      caseNumber: `${today.getFullYear().toString().slice(-2)}0004`,
      organizationId: org.id,
      locationId: mainLocation.id,
      directorId: directorUser.id,
      status: 'CLOSED',
      stage: 'CLOSE',
      serviceType: 'DIRECT_CREMATION',
      disposition: 'CREMATION',
      closedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      decedentId: decedent4.id,
    },
  })

  // Case 5: Waiting on family (portal session)
  const decedent5 = await prisma.person.create({
    data: {
      firstName: 'George',
      lastName: 'Brown',
      dateOfBirth: new Date('1948-09-30'),
      dateOfDeath: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  const case5 = await prisma.case.create({
    data: {
      caseNumber: `${today.getFullYear().toString().slice(-2)}0005`,
      organizationId: org.id,
      locationId: mainLocation.id,
      directorId: staffUser.id,
      status: 'ACTIVE',
      stage: 'INTAKE',
      serviceType: 'CELEBRATION_OF_LIFE',
      disposition: 'CREMATION',
      decedentId: decedent5.id,
    },
  })

  await prisma.familyPortalSession.create({
    data: {
      caseId: case5.id,
      email: 'family@example.com',
      status: 'IN_PROGRESS',
      progress: JSON.stringify({ step: 2, completed: ['welcome', 'about'] }),
      expiresAt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✓ Created demo cases')

  // Create audit events
  await prisma.auditEvent.createMany({
    data: [
      {
        organizationId: org.id,
        caseId: case1.id,
        userId: directorUser.id,
        eventType: 'CASE_CREATED',
        entityType: 'Case',
        entityId: case1.id,
        description: `Case ${case1.caseNumber} created for Robert Thompson`,
      },
      {
        organizationId: org.id,
        caseId: case1.id,
        userId: directorUser.id,
        eventType: 'STAGE_CHANGED',
        entityType: 'Case',
        entityId: case1.id,
        description: 'Stage changed from INTAKE to DOCUMENTS',
        metadata: JSON.stringify({ from: 'INTAKE', to: 'DOCUMENTS' }),
      },
    ],
  })

  console.log('✓ Created audit events')

  console.log('')
  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('Demo Credentials:')
  console.log('  Admin: admin@demo.funeralops.com / demo123')
  console.log('  Director: director@demo.funeralops.com / demo123')
  console.log('  Staff: staff@demo.funeralops.com / demo123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
