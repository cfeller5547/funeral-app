'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CaseStatusBadge, CaseStageBadge, BlockerCountBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { getPersonFullName, formatCaseNumber } from '@/types'
import type { Case, Person, User, Location, CaseStatus, CaseStage } from '@prisma/client'

type CaseWithRelations = Case & {
  decedent: Person | null
  director: User | null
  location: Location
  _count: { blockers: number }
}

interface CaseListProps {
  cases: CaseWithRelations[]
  locations: { id: string; name: string }[]
  directors: { id: string; name: string }[]
}

export function CaseList({ cases, locations, directors }: CaseListProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [directorFilter, setDirectorFilter] = useState<string>('all')

  const filteredCases = cases.filter((caseItem) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const decedentName = getPersonFullName(caseItem.decedent).toLowerCase()
      const caseNumber = caseItem.caseNumber.toLowerCase()
      if (!decedentName.includes(searchLower) && !caseNumber.includes(searchLower)) {
        return false
      }
    }

    // Status filter
    if (statusFilter !== 'all' && caseItem.status !== statusFilter) {
      return false
    }

    // Stage filter
    if (stageFilter !== 'all' && caseItem.stage !== stageFilter) {
      return false
    }

    // Location filter
    if (locationFilter !== 'all' && caseItem.locationId !== locationFilter) {
      return false
    }

    // Director filter
    if (directorFilter !== 'all' && caseItem.directorId !== directorFilter) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cases</h1>
          <p className="text-sm text-muted-foreground">
            {filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'}
          </p>
        </div>
        <Button onClick={() => router.push('/app/cases/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or case #..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="INTAKE">Intake</SelectItem>
                <SelectItem value="ARRANGEMENT">Arrangement</SelectItem>
                <SelectItem value="DOCUMENTS">Documents</SelectItem>
                <SelectItem value="SIGNATURES">Signatures</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
                <SelectItem value="DISPOSITION">Disposition</SelectItem>
                <SelectItem value="CLOSE">Close</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={directorFilter} onValueChange={setDirectorFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Director" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directors</SelectItem>
                {directors.map((director) => (
                  <SelectItem key={director.id} value={director.id}>
                    {director.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCases.length === 0 ? (
            <EmptyState
              title="No cases found"
              description={search || statusFilter !== 'all' || stageFilter !== 'all'
                ? "Try adjusting your filters"
                : "Create your first case to get started"
              }
              action={
                !search && statusFilter === 'all' && stageFilter === 'all'
                  ? {
                      label: 'Create Case',
                      onClick: () => router.push('/app/cases/new'),
                    }
                  : undefined
              }
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Decedent</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Director</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Blockers</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((caseItem) => (
                  <TableRow
                    key={caseItem.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/app/cases/${caseItem.id}`)}
                  >
                    <TableCell className="font-medium">
                      {formatCaseNumber(caseItem.caseNumber)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getPersonFullName(caseItem.decedent)}</p>
                        <p className="text-xs text-muted-foreground">{caseItem.location.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CaseStageBadge stage={caseItem.stage} />
                    </TableCell>
                    <TableCell>
                      <CaseStatusBadge status={caseItem.status} />
                    </TableCell>
                    <TableCell>{caseItem.director?.name || '—'}</TableCell>
                    <TableCell>
                      {caseItem.serviceDate
                        ? format(new Date(caseItem.serviceDate), 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {caseItem._count.blockers > 0 ? (
                        <BlockerCountBadge count={caseItem._count.blockers} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(caseItem.updatedAt), 'MMM d')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
