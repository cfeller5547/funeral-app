'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileSignature,
  MoreHorizontal,
  Copy,
  RefreshCcw,
  XCircle,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

type SignatureRequestStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PARTIALLY_SIGNED' | 'COMPLETED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED'
type SignerStatus = 'PENDING' | 'SENT' | 'VIEWED' | 'SIGNED' | 'DECLINED'

interface Signer {
  id: string
  name: string
  email: string
  role: string
  order: number
  status: SignerStatus
  signedAt?: Date | null
}

interface SignatureRequest {
  id: string
  status: SignatureRequestStatus
  createdAt: Date
  document: {
    id: string
    name: string
    tag: string
    case: {
      caseNumber: string
      decedent: {
        firstName: string
        lastName: string
      } | null
    }
  }
  signers: Signer[]
}

interface SignatureStatusCardProps {
  request: SignatureRequest
  onCopyLink?: (signerId: string) => void
  onResend?: (signerId: string) => void
  onCancel?: () => void
}

const requestStatusConfig: Record<SignatureRequestStatus, {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
  icon: typeof CheckCircle2
}> = {
  DRAFT: { label: 'Draft', variant: 'secondary', icon: Clock },
  SENT: { label: 'Sent', variant: 'outline', icon: Mail },
  VIEWED: { label: 'Viewed', variant: 'outline', icon: Eye },
  PARTIALLY_SIGNED: { label: 'Partially Signed', variant: 'default', icon: FileSignature },
  COMPLETED: { label: 'Completed', variant: 'default', icon: CheckCircle2 },
  DECLINED: { label: 'Declined', variant: 'destructive', icon: XCircle },
  EXPIRED: { label: 'Expired', variant: 'secondary', icon: Clock },
  CANCELLED: { label: 'Cancelled', variant: 'secondary', icon: XCircle },
}

const signerStatusConfig: Record<SignerStatus, {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
}> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  SENT: { label: 'Sent', variant: 'outline' },
  VIEWED: { label: 'Viewed', variant: 'outline' },
  SIGNED: { label: 'Signed', variant: 'default' },
  DECLINED: { label: 'Declined', variant: 'destructive' },
}

export function SignatureStatusCard({
  request,
  onCopyLink,
  onResend,
  onCancel,
}: SignatureStatusCardProps) {
  const statusConfig = requestStatusConfig[request.status]
  const StatusIcon = statusConfig.icon

  const handleCopyLink = async (signerId: string) => {
    if (onCopyLink) {
      onCopyLink(signerId)
    } else {
      // Mock copy action
      await navigator.clipboard.writeText(`${window.location.origin}/sign/${request.id}/${signerId}`)
      toast.success('Signing link copied to clipboard')
    }
  }

  const handleResend = (signerId: string) => {
    if (onResend) {
      onResend(signerId)
    } else {
      toast.success('Notification resent')
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      toast.success('Signature request cancelled')
    }
  }

  const canCancel = !['COMPLETED', 'DECLINED', 'EXPIRED', 'CANCELLED'].includes(request.status)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileSignature className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {request.document.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {request.document.case.caseNumber}
                {request.document.case.decedent && (
                  <> - {request.document.case.decedent.firstName} {request.document.case.decedent.lastName}</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
            {canCancel && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCancel} className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Request
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Signers</p>
          {request.signers.map((signer) => {
            const signerConfig = signerStatusConfig[signer.status]
            const canTakeAction = ['PENDING', 'SENT', 'VIEWED'].includes(signer.status)

            return (
              <div
                key={signer.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-medium">
                    {signer.order}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{signer.name}</p>
                    <p className="text-xs text-muted-foreground">{signer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={signerConfig.variant} className="text-xs">
                    {signerConfig.label}
                  </Badge>
                  {canTakeAction && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyLink(signer.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Signing Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResend(signer.id)}>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Resend Notification
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Created {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}
