'use client'

import { FileText, MoreHorizontal, Download, Eye, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'

type DocumentStatus = 'DRAFT' | 'GENERATED' | 'UPLOADED' | 'SENT_FOR_SIGNATURE' | 'SIGNED' | 'ARCHIVED'

type DocumentTag =
  | 'GPL'
  | 'CONTRACT'
  | 'AUTHORIZATION_CREMATION'
  | 'AUTHORIZATION_EMBALMING'
  | 'AUTHORIZATION_DISPOSITION'
  | 'PERMIT_BURIAL'
  | 'PERMIT_TRANSIT'
  | 'DEATH_CERTIFICATE'
  | 'ID_VERIFICATION'
  | 'OBITUARY'
  | 'PROGRAM'
  | 'CHECKLIST'
  | 'OTHER'

interface Document {
  id: string
  name: string
  tag: DocumentTag
  status: DocumentStatus
  version: number
  createdAt: Date
  template: {
    name: string
    tag: DocumentTag
  } | null
  case: {
    caseNumber: string
    decedent: {
      firstName: string
      lastName: string
    } | null
  }
}

interface DocumentListProps {
  documents: Document[]
  onView?: (doc: Document) => void
  onDownload?: (doc: Document) => void
  onSendForSignature?: (doc: Document) => void
  onDelete?: (doc: Document) => void
}

const statusStyles: Record<DocumentStatus, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
  DRAFT: { variant: 'secondary', label: 'Draft' },
  GENERATED: { variant: 'outline', label: 'Generated' },
  UPLOADED: { variant: 'outline', label: 'Uploaded' },
  SENT_FOR_SIGNATURE: { variant: 'outline', label: 'Pending Signature' },
  SIGNED: { variant: 'default', label: 'Signed' },
  ARCHIVED: { variant: 'secondary', label: 'Archived' },
}

const tagLabels: Record<DocumentTag, string> = {
  GPL: 'GPL',
  CONTRACT: 'Contract',
  AUTHORIZATION_CREMATION: 'Cremation Auth',
  AUTHORIZATION_EMBALMING: 'Embalming Auth',
  AUTHORIZATION_DISPOSITION: 'Disposition Auth',
  PERMIT_BURIAL: 'Burial Permit',
  PERMIT_TRANSIT: 'Transit Permit',
  DEATH_CERTIFICATE: 'Death Certificate',
  ID_VERIFICATION: 'ID Verification',
  OBITUARY: 'Obituary',
  PROGRAM: 'Program',
  CHECKLIST: 'Checklist',
  OTHER: 'Other',
}

export function DocumentList({
  documents,
  onView,
  onDownload,
  onSendForSignature,
  onDelete,
}: DocumentListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Case</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => {
          const statusStyle = statusStyles[doc.status]
          return (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tagLabels[doc.tag]}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{doc.case.caseNumber}</p>
                  {doc.case.decedent && (
                    <p className="text-xs text-muted-foreground">
                      {doc.case.decedent.firstName} {doc.case.decedent.lastName}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusStyle.variant}>
                  {statusStyle.label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                v{doc.version}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(doc)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload?.(doc)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    {(doc.status === 'DRAFT' || doc.status === 'GENERATED') && (
                      <DropdownMenuItem onClick={() => onSendForSignature?.(doc)}>
                        <Send className="mr-2 h-4 w-4" />
                        Send for Signature
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(doc)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
