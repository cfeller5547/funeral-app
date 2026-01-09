'use client'

import { Package, MoreHorizontal, Edit, Trash2, Play } from 'lucide-react'
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

interface PackItem {
  template: {
    id: string
    name: string
    tag: DocumentTag
  }
}

interface Pack {
  id: string
  name: string
  description: string | null
  items: PackItem[]
  _count: {
    items: number
  }
  updatedAt: Date
}

interface PackListProps {
  packs: Pack[]
  onEdit?: (pack: Pack) => void
  onDelete?: (pack: Pack) => void
  onGenerate?: (pack: Pack) => void
}

export function PackList({
  packs,
  onEdit,
  onDelete,
  onGenerate,
}: PackListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Templates</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packs.map((pack) => (
          <TableRow key={pack.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{pack.name}</p>
                  {pack.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {pack.description}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {pack.items.slice(0, 3).map(({ template }) => (
                  <Badge key={template.id} variant="outline" className="text-xs">
                    {template.name}
                  </Badge>
                ))}
                {pack._count.items > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{pack._count.items - 3} more
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(pack.updatedAt), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onGenerate?.(pack)}
                  className="h-8"
                >
                  <Play className="mr-1 h-3 w-3" />
                  Generate
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(pack)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(pack)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
