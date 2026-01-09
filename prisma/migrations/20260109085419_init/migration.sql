-- CreateEnum
CREATE TYPE "NicheMode" AS ENUM ('GENERAL', 'CREMATION_FIRST', 'MULTI_LOCATION', 'REMOVAL_HEAVY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'DIRECTOR', 'STAFF', 'READONLY');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CaseStage" AS ENUM ('INTAKE', 'ARRANGEMENT', 'DOCUMENTS', 'SIGNATURES', 'SERVICE', 'DISPOSITION', 'CLOSE');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('TRADITIONAL', 'MEMORIAL', 'GRAVESIDE', 'DIRECT_CREMATION', 'DIRECT_BURIAL', 'CELEBRATION_OF_LIFE');

-- CreateEnum
CREATE TYPE "Disposition" AS ENUM ('BURIAL', 'CREMATION', 'ENTOMBMENT', 'DONATION', 'TRANSFER');

-- CreateEnum
CREATE TYPE "ContactRole" AS ENUM ('NEXT_OF_KIN', 'INFORMANT', 'PURCHASER', 'AUTHORIZED_AGENT', 'CLERGY', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DocumentTag" AS ENUM ('GPL', 'CONTRACT', 'AUTHORIZATION_CREMATION', 'AUTHORIZATION_EMBALMING', 'AUTHORIZATION_DISPOSITION', 'PERMIT_BURIAL', 'PERMIT_TRANSIT', 'DEATH_CERTIFICATE', 'ID_VERIFICATION', 'OBITUARY', 'PROGRAM', 'CHECKLIST', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'GENERATED', 'UPLOADED', 'SENT_FOR_SIGNATURE', 'SIGNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('DRAFT', 'PENDING', 'PARTIALLY_SIGNED', 'COMPLETED', 'DECLINED', 'EXPIRED', 'VOIDED');

-- CreateEnum
CREATE TYPE "SignerStatus" AS ENUM ('PENDING', 'SENT', 'VIEWED', 'SIGNED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('ALWAYS', 'DISPOSITION_EQUALS', 'SERVICE_TYPE_EQUALS', 'STAGE_GTE', 'STAGE_EQUALS', 'FIELD_PRESENT');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('DOCUMENT_EXISTS', 'DOCUMENT_SIGNED', 'FIELD_COMPLETED', 'SIGNATURE_COMPLETED');

-- CreateEnum
CREATE TYPE "RuleSeverity" AS ENUM ('BLOCKER', 'WARNING');

-- CreateEnum
CREATE TYPE "PortalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InboundEmailStatus" AS ENUM ('PENDING', 'PROCESSED', 'LINKED', 'IGNORED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "nicheMode" "NicheMode" NOT NULL DEFAULT 'GENERAL',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "phone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inviteToken" TEXT,
    "inviteExpiry" TIMESTAMP(3),
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("userId","locationId")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "directorId" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'DRAFT',
    "stage" "CaseStage" NOT NULL DEFAULT 'INTAKE',
    "serviceType" "ServiceType" NOT NULL DEFAULT 'TRADITIONAL',
    "disposition" "Disposition" NOT NULL DEFAULT 'BURIAL',
    "serviceDate" TIMESTAMP(3),
    "serviceTime" TEXT,
    "serviceLocation" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "decedentId" TEXT,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "dateOfDeath" TIMESTAMP(3),
    "placeOfDeath" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "ssn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseContact" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "role" "ContactRole" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CaseContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "dueTime" TEXT,
    "stage" "CaseStage",
    "tags" TEXT[],
    "assigneeId" TEXT,
    "createdById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tag" "DocumentTag" NOT NULL,
    "content" TEXT NOT NULL,
    "signatureFields" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePack" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplatePack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePackItem" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TemplatePackItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stage" "CaseStage",
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "daysOffset" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "tag" "DocumentTag" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureRequest" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "providerId" TEXT,
    "providerName" TEXT NOT NULL DEFAULT 'mock',
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureRequestSigner" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "status" "SignerStatus" NOT NULL DEFAULT 'PENDING',
    "signedAt" TIMESTAMP(3),
    "signedIp" TEXT,

    CONSTRAINT "SignatureRequestSigner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditionType" "ConditionType" NOT NULL,
    "conditionField" TEXT,
    "conditionValue" TEXT,
    "requirementType" "RequirementType" NOT NULL,
    "requirementTag" "DocumentTag",
    "requirementField" TEXT,
    "requiresSigned" BOOLEAN NOT NULL DEFAULT false,
    "severity" "RuleSeverity" NOT NULL DEFAULT 'BLOCKER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blocker" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fixAction" TEXT,
    "fixUrl" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyPortalSession" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "status" "PortalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" JSONB NOT NULL DEFAULT '{}',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyPortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "caseId" TEXT,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceList" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceListItem" (
    "id" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PriceListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundEmail" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "status" "InboundEmailStatus" NOT NULL DEFAULT 'PENDING',
    "parsedData" JSONB,
    "linkedCaseId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "InboundEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Location_organizationId_idx" ON "Location"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_inviteToken_key" ON "User"("inviteToken");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Case_decedentId_key" ON "Case"("decedentId");

-- CreateIndex
CREATE INDEX "Case_organizationId_status_idx" ON "Case"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Case_locationId_idx" ON "Case"("locationId");

-- CreateIndex
CREATE INDEX "Case_directorId_idx" ON "Case"("directorId");

-- CreateIndex
CREATE INDEX "Case_stage_idx" ON "Case"("stage");

-- CreateIndex
CREATE INDEX "Case_serviceDate_idx" ON "Case"("serviceDate");

-- CreateIndex
CREATE UNIQUE INDEX "Case_organizationId_caseNumber_key" ON "Case"("organizationId", "caseNumber");

-- CreateIndex
CREATE INDEX "Person_lastName_firstName_idx" ON "Person"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "CaseContact_caseId_idx" ON "CaseContact"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseContact_caseId_personId_role_key" ON "CaseContact"("caseId", "personId", "role");

-- CreateIndex
CREATE INDEX "Task_caseId_idx" ON "Task"("caseId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_status_idx" ON "Task"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "DocumentTemplate_organizationId_tag_idx" ON "DocumentTemplate"("organizationId", "tag");

-- CreateIndex
CREATE INDEX "TemplatePack_organizationId_idx" ON "TemplatePack"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePackItem_packId_templateId_key" ON "TemplatePackItem"("packId", "templateId");

-- CreateIndex
CREATE INDEX "Document_caseId_tag_idx" ON "Document"("caseId", "tag");

-- CreateIndex
CREATE INDEX "Document_caseId_status_idx" ON "Document"("caseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SignatureRequest_documentId_key" ON "SignatureRequest"("documentId");

-- CreateIndex
CREATE INDEX "SignatureRequest_caseId_idx" ON "SignatureRequest"("caseId");

-- CreateIndex
CREATE INDEX "SignatureRequest_status_idx" ON "SignatureRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SignatureRequestSigner_requestId_email_key" ON "SignatureRequestSigner"("requestId", "email");

-- CreateIndex
CREATE INDEX "ComplianceRule_organizationId_isActive_idx" ON "ComplianceRule"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "Blocker_caseId_isResolved_idx" ON "Blocker"("caseId", "isResolved");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyPortalSession_token_key" ON "FamilyPortalSession"("token");

-- CreateIndex
CREATE INDEX "FamilyPortalSession_token_idx" ON "FamilyPortalSession"("token");

-- CreateIndex
CREATE INDEX "FamilyPortalSession_caseId_idx" ON "FamilyPortalSession"("caseId");

-- CreateIndex
CREATE INDEX "AuditEvent_caseId_idx" ON "AuditEvent"("caseId");

-- CreateIndex
CREATE INDEX "AuditEvent_userId_idx" ON "AuditEvent"("userId");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_idx" ON "AuditEvent"("eventType");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_createdAt_idx" ON "AuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "PriceList_organizationId_isActive_idx" ON "PriceList"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "PriceListItem_priceListId_category_idx" ON "PriceListItem"("priceListId", "category");

-- CreateIndex
CREATE INDEX "InboundEmail_organizationId_status_idx" ON "InboundEmail"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_decedentId_fkey" FOREIGN KEY ("decedentId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseContact" ADD CONSTRAINT "CaseContact_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseContact" ADD CONSTRAINT "CaseContact_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePack" ADD CONSTRAINT "TemplatePack_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePackItem" ADD CONSTRAINT "TemplatePackItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "TemplatePack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePackItem" ADD CONSTRAINT "TemplatePackItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_packId_fkey" FOREIGN KEY ("packId") REFERENCES "TemplatePack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRequest" ADD CONSTRAINT "SignatureRequest_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRequest" ADD CONSTRAINT "SignatureRequest_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRequestSigner" ADD CONSTRAINT "SignatureRequestSigner_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SignatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRule" ADD CONSTRAINT "ComplianceRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ComplianceRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyPortalSession" ADD CONSTRAINT "FamilyPortalSession_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundEmail" ADD CONSTRAINT "InboundEmail_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
