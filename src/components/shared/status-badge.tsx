import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CaseStatus, CaseStage, TaskStatus, DocumentStatus, SignatureStatus } from '@prisma/client'

type BadgeVariant = 'blocked' | 'pending' | 'ready' | 'draft' | 'default'

interface StatusBadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  blocked: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  pending: 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/40',
  ready: 'bg-success text-success-foreground hover:bg-success/90',
  draft: 'bg-muted text-muted-foreground hover:bg-muted/90',
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(variantStyles[variant], className)}>
      {children}
    </Badge>
  )
}

// Helper components for specific status types
export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const config: Record<CaseStatus, { variant: BadgeVariant; label: string }> = {
    DRAFT: { variant: 'draft', label: 'Draft' },
    ACTIVE: { variant: 'default', label: 'Active' },
    CLOSED: { variant: 'ready', label: 'Closed' },
    ARCHIVED: { variant: 'draft', label: 'Archived' },
  }

  const { variant, label } = config[status]
  return <StatusBadge variant={variant}>{label}</StatusBadge>
}

export function CaseStageBadge({ stage }: { stage: CaseStage }) {
  const config: Record<CaseStage, { variant: BadgeVariant; label: string }> = {
    INTAKE: { variant: 'pending', label: 'Intake' },
    ARRANGEMENT: { variant: 'pending', label: 'Arrangement' },
    DOCUMENTS: { variant: 'pending', label: 'Documents' },
    SIGNATURES: { variant: 'pending', label: 'Signatures' },
    SERVICE: { variant: 'pending', label: 'Service' },
    DISPOSITION: { variant: 'pending', label: 'Disposition' },
    CLOSE: { variant: 'ready', label: 'Close' },
  }

  const { variant, label } = config[stage]
  return <StatusBadge variant={variant}>{label}</StatusBadge>
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config: Record<TaskStatus, { variant: BadgeVariant; label: string }> = {
    OPEN: { variant: 'pending', label: 'Open' },
    DONE: { variant: 'ready', label: 'Done' },
    BLOCKED: { variant: 'blocked', label: 'Blocked' },
  }

  const { variant, label } = config[status]
  return <StatusBadge variant={variant}>{label}</StatusBadge>
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const config: Record<DocumentStatus, { variant: BadgeVariant; label: string }> = {
    DRAFT: { variant: 'draft', label: 'Draft' },
    GENERATED: { variant: 'pending', label: 'Generated' },
    UPLOADED: { variant: 'pending', label: 'Uploaded' },
    SENT_FOR_SIGNATURE: { variant: 'pending', label: 'Sent' },
    SIGNED: { variant: 'ready', label: 'Signed' },
    ARCHIVED: { variant: 'draft', label: 'Archived' },
  }

  const { variant, label } = config[status]
  return <StatusBadge variant={variant}>{label}</StatusBadge>
}

export function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  const config: Record<SignatureStatus, { variant: BadgeVariant; label: string }> = {
    DRAFT: { variant: 'draft', label: 'Draft' },
    PENDING: { variant: 'pending', label: 'Pending' },
    PARTIALLY_SIGNED: { variant: 'pending', label: 'Partial' },
    COMPLETED: { variant: 'ready', label: 'Completed' },
    DECLINED: { variant: 'blocked', label: 'Declined' },
    EXPIRED: { variant: 'draft', label: 'Expired' },
    VOIDED: { variant: 'draft', label: 'Voided' },
  }

  const { variant, label } = config[status]
  return <StatusBadge variant={variant}>{label}</StatusBadge>
}

export function BlockerCountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <StatusBadge variant="blocked" className="ml-2">
      {count} {count === 1 ? 'blocker' : 'blockers'}
    </StatusBadge>
  )
}
