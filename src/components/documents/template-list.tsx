'use client'

import { FileText, MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface Template {
  id: string
  name: string
  description: string | null
  tag: DocumentTag
  content: string
  isActive: boolean
  updatedAt: Date
}

interface TemplateListProps {
  templates: Template[]
  onEdit?: (template: Template) => void
  onDelete?: (template: Template) => void
  onDuplicate?: (template: Template) => void
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

export function TemplateList({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
}: TemplateListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Tag</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{template.name}</p>
                  {template.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{tagLabels[template.tag]}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={template.isActive ? 'default' : 'secondary'}>
                {template.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(template)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(template)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(template)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
