import {
  Case,
  CaseStatus,
  CaseStage,
  ServiceType,
  Disposition,
  Person,
  CaseContact,
  ContactRole,
  Task,
  TaskStatus,
  TaskPriority,
  Document,
  DocumentTag,
  DocumentStatus,
  SignatureRequest,
  SignatureStatus,
  SignerStatus,
  ComplianceRule,
  Blocker,
  User,
  UserRole,
  Organization,
  Location,
} from '@prisma/client'

// Re-export Prisma types
export type {
  Case,
  CaseStatus,
  CaseStage,
  ServiceType,
  Disposition,
  Person,
  CaseContact,
  ContactRole,
  Task,
  TaskStatus,
  TaskPriority,
  Document,
  DocumentTag,
  DocumentStatus,
  SignatureRequest,
  SignatureStatus,
  SignerStatus,
  ComplianceRule,
  Blocker,
  User,
  UserRole,
  Organization,
  Location,
}

// Extended types with relations
export type CaseWithRelations = Case & {
  decedent: Person | null
  contacts: (CaseContact & { person: Person })[]
  director: User | null
  location: Location
  tasks: Task[]
  documents: Document[]
  signatureRequests: SignatureRequest[]
  blockers: Blocker[]
}

export type TaskWithRelations = Task & {
  case: Case & { decedent: Person | null }
  assignee: User | null
}

export type BlockerWithRule = Blocker & {
  rule: ComplianceRule
}

// Stage order for comparison
export const STAGE_ORDER: Record<CaseStage, number> = {
  INTAKE: 0,
  ARRANGEMENT: 1,
  DOCUMENTS: 2,
  SIGNATURES: 3,
  SERVICE: 4,
  DISPOSITION: 5,
  CLOSE: 6,
}

// Human-readable labels
export const STAGE_LABELS: Record<CaseStage, string> = {
  INTAKE: 'Intake',
  ARRANGEMENT: 'Arrangement',
  DOCUMENTS: 'Documents',
  SIGNATURES: 'Signatures',
  SERVICE: 'Service',
  DISPOSITION: 'Disposition',
  CLOSE: 'Close',
}

export const STATUS_LABELS: Record<CaseStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
}

export const DISPOSITION_LABELS: Record<Disposition, string> = {
  BURIAL: 'Burial',
  CREMATION: 'Cremation',
  ENTOMBMENT: 'Entombment',
  DONATION: 'Body Donation',
  TRANSFER: 'Transfer',
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  TRADITIONAL: 'Traditional Service',
  MEMORIAL: 'Memorial Service',
  GRAVESIDE: 'Graveside Service',
  DIRECT_CREMATION: 'Direct Cremation',
  DIRECT_BURIAL: 'Direct Burial',
  CELEBRATION_OF_LIFE: 'Celebration of Life',
}

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  NEXT_OF_KIN: 'Next of Kin',
  INFORMANT: 'Informant',
  PURCHASER: 'Purchaser',
  AUTHORIZED_AGENT: 'Authorized Agent',
  CLERGY: 'Clergy',
  OTHER: 'Other',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const DOCUMENT_TAG_LABELS: Record<DocumentTag, string> = {
  GPL: 'General Price List',
  CONTRACT: 'Contract',
  AUTHORIZATION_CREMATION: 'Cremation Authorization',
  AUTHORIZATION_EMBALMING: 'Embalming Authorization',
  AUTHORIZATION_DISPOSITION: 'Disposition Authorization',
  PERMIT_BURIAL: 'Burial Permit',
  PERMIT_TRANSIT: 'Transit Permit',
  DEATH_CERTIFICATE: 'Death Certificate Worksheet',
  ID_VERIFICATION: 'ID Verification',
  OBITUARY: 'Obituary',
  PROGRAM: 'Program',
  CHECKLIST: 'Checklist',
  OTHER: 'Other',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  DIRECTOR: 'Director',
  STAFF: 'Staff',
  READONLY: 'Read Only',
}

// Navigation items
export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
  adminOnly?: boolean
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Form types
export interface CreateCaseInput {
  locationId: string
  directorId?: string
  serviceType: ServiceType
  disposition: Disposition
  serviceDate?: Date
  serviceTime?: string
  decedent: {
    firstName: string
    middleName?: string
    lastName: string
    suffix?: string
    dateOfBirth?: Date
    dateOfDeath?: Date
    placeOfDeath?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }
  primaryContact?: {
    firstName: string
    lastName: string
    phone?: string
    email?: string
    role: ContactRole
  }
  notes?: string
}

// Utility type for person full name
export function getPersonFullName(person: Person | null): string {
  if (!person) return 'Unknown'
  const parts = [person.firstName, person.middleName, person.lastName, person.suffix].filter(Boolean)
  return parts.join(' ')
}

// Format case number
export function formatCaseNumber(caseNumber: string): string {
  return `#${caseNumber}`
}
