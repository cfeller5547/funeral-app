'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
  Users,
  CheckSquare,
  PenTool,
  Calendar,
  Package,
  Lock,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { CaseStatusBadge, CaseStageBadge, BlockerCountBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { getPersonFullName, formatCaseNumber, STAGE_LABELS, DISPOSITION_LABELS, SERVICE_TYPE_LABELS, STAGE_ORDER } from '@/types'
import { cn } from '@/lib/utils'
import type {
  Case,
  Person,
  User,
  Location,
  CaseContact,
  Task,
  Document,
  DocumentTemplate,
  SignatureRequest,
  SignatureRequestSigner,
  Blocker,
  ComplianceRule,
  FamilyPortalSession,
  TemplatePack,
  TemplatePackItem,
  CaseStage,
} from '@prisma/client'

type CaseWithRelations = Case & {
  decedent: Person | null
  director: User | null
  location: Location
  contacts: (CaseContact & { person: Person })[]
  tasks: (Task & { assignee: User | null })[]
  documents: (Document & {
    template: DocumentTemplate | null
    signatureRequest: (SignatureRequest & { signers: SignatureRequestSigner[] }) | null
  })[]
  signatureRequests: (SignatureRequest & {
    document: Document
    signers: SignatureRequestSigner[]
  })[]
  blockers: (Blocker & { rule: ComplianceRule })[]
  portalSessions: FamilyPortalSession[]
}

type TemplatePackWithItems = TemplatePack & {
  items: (TemplatePackItem & { template: DocumentTemplate })[]
}

interface CaseTimelineProps {
  caseData: CaseWithRelations
  directors: { id: string; name: string }[]
  templatePacks: TemplatePackWithItems[]
  currentUserId: string
}

const STAGES: CaseStage[] = ['INTAKE', 'ARRANGEMENT', 'DOCUMENTS', 'SIGNATURES', 'SERVICE', 'DISPOSITION', 'CLOSE']

export function CaseTimeline({
  caseData,
  directors,
  templatePacks,
  currentUserId,
}: CaseTimelineProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const currentStageIndex = STAGE_ORDER[caseData.stage]
  const blockerCount = caseData.blockers.length

  const getPrimaryAction = () => {
    switch (caseData.stage) {
      case 'INTAKE':
        return { label: 'Generate Arrangement Packet', action: () => {} }
      case 'ARRANGEMENT':
      case 'DOCUMENTS':
        return { label: 'Request Signatures', action: () => {} }
      case 'SIGNATURES':
        return { label: 'Advance to Service', action: () => {} }
      case 'SERVICE':
        return { label: 'Complete Service', action: () => {} }
      case 'DISPOSITION':
        return { label: 'Proceed to Close', action: () => {} }
      case 'CLOSE':
        return { label: 'Close Case', action: () => {} }
      default:
        return null
    }
  }

  const primaryAction = getPrimaryAction()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/app/cases')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">
                {getPersonFullName(caseData.decedent)}
              </h1>
              <CaseStatusBadge status={caseData.status} />
              <CaseStageBadge stage={caseData.stage} />
              {blockerCount > 0 && <BlockerCountBadge count={blockerCount} />}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatCaseNumber(caseData.caseNumber)} • {caseData.location.name}
              {caseData.director && ` • ${caseData.director.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {blockerCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="destructive" size="sm">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {blockerCount} {blockerCount === 1 ? 'Blocker' : 'Blockers'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {caseData.blockers.map((blocker) => (
                  <DropdownMenuItem key={blocker.id} className="flex flex-col items-start py-3">
                    <span className="font-medium">{blocker.rule.name}</span>
                    <span className="text-xs text-muted-foreground">{blocker.message}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {primaryAction && (
            <Button onClick={primaryAction.action}>
              {primaryAction.label}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Case</DropdownMenuItem>
              <DropdownMenuItem>Send Portal Link</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export Case</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Archive Case</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Timeline Sidebar */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative px-4 pb-4">
              {STAGES.map((stage, index) => {
                const stageIndex = STAGE_ORDER[stage]
                const isComplete = stageIndex < currentStageIndex
                const isCurrent = stageIndex === currentStageIndex
                const isLocked = stageIndex > currentStageIndex

                return (
                  <div key={stage} className="relative flex items-center gap-3 py-2">
                    {/* Connector line */}
                    {index < STAGES.length - 1 && (
                      <div
                        className={cn(
                          'absolute left-[11px] top-8 h-[calc(100%-8px)] w-0.5',
                          isComplete ? 'bg-primary' : 'bg-border'
                        )}
                      />
                    )}

                    {/* Stage indicator */}
                    <div
                      className={cn(
                        'relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        isComplete && 'bg-primary text-primary-foreground',
                        isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                        isLocked && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isComplete ? '✓' : isLocked ? <Lock className="h-3 w-3" /> : index + 1}
                    </div>

                    {/* Stage label */}
                    <span
                      className={cn(
                        'text-sm',
                        isCurrent && 'font-medium text-foreground',
                        !isCurrent && 'text-muted-foreground'
                      )}
                    >
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="signatures">Signatures</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Case Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Case Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow label="Service Type" value={SERVICE_TYPE_LABELS[caseData.serviceType]} />
                  <DetailRow label="Disposition" value={DISPOSITION_LABELS[caseData.disposition]} />
                  <DetailRow
                    label="Service Date"
                    value={
                      caseData.serviceDate
                        ? format(new Date(caseData.serviceDate), 'PPP')
                        : 'Not scheduled'
                    }
                  />
                  {caseData.serviceTime && (
                    <DetailRow label="Service Time" value={caseData.serviceTime} />
                  )}
                  {caseData.serviceLocation && (
                    <DetailRow label="Service Location" value={caseData.serviceLocation} />
                  )}
                </CardContent>
              </Card>

              {/* Decedent Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Decedent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow label="Name" value={getPersonFullName(caseData.decedent)} />
                  {caseData.decedent?.dateOfBirth && (
                    <DetailRow
                      label="Date of Birth"
                      value={format(new Date(caseData.decedent.dateOfBirth), 'PPP')}
                    />
                  )}
                  {caseData.decedent?.dateOfDeath && (
                    <DetailRow
                      label="Date of Death"
                      value={format(new Date(caseData.decedent.dateOfDeath), 'PPP')}
                    />
                  )}
                  {caseData.decedent?.placeOfDeath && (
                    <DetailRow label="Place of Death" value={caseData.decedent.placeOfDeath} />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {caseData.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {caseData.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                <Button size="sm">Add Contact</Button>
              </CardHeader>
              <CardContent>
                {caseData.contacts.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No contacts added"
                    description="Add the purchaser or next-of-kin to enable portal and signatures."
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-3">
                    {caseData.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {contact.person.firstName} {contact.person.lastName}
                            {contact.isPrimary && (
                              <Badge variant="secondary" className="ml-2">
                                Primary
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contact.role.replace('_', ' ')}
                          </p>
                          {contact.person.phone && (
                            <p className="text-sm text-muted-foreground">{contact.person.phone}</p>
                          )}
                          {contact.person.email && (
                            <p className="text-sm text-muted-foreground">{contact.person.email}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                <Button size="sm">Add Task</Button>
              </CardHeader>
              <CardContent>
                {caseData.tasks.length === 0 ? (
                  <EmptyState
                    icon={CheckSquare}
                    title="No tasks"
                    description="Add tasks to track work for this case."
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-2">
                    {caseData.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.status === 'DONE'}
                            className="h-4 w-4 rounded border-gray-300"
                            readOnly
                          />
                          <div>
                            <p
                              className={cn(
                                'text-sm',
                                task.status === 'DONE' && 'line-through text-muted-foreground'
                              )}
                            >
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {task.assignee?.name || 'Unassigned'}
                              {task.dueDate && ` • Due ${format(new Date(task.dueDate), 'MMM d')}`}
                            </p>
                          </div>
                        </div>
                        {task.priority === 'URGENT' && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Upload
                  </Button>
                  <Button size="sm">Generate Pack</Button>
                </div>
              </CardHeader>
              <CardContent>
                {caseData.documents.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No documents"
                    description="Generate a document pack or upload files."
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-2">
                    {caseData.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.tag.replace('_', ' ')} • {doc.status}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signatures Tab */}
          <TabsContent value="signatures" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Signature Requests</CardTitle>
                <Button size="sm">New Request</Button>
              </CardHeader>
              <CardContent>
                {caseData.signatureRequests.length === 0 ? (
                  <EmptyState
                    icon={PenTool}
                    title="No signature requests"
                    description="Create a signature request for documents that need to be signed."
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-2">
                    {caseData.signatureRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{request.document.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.signers.length} signers • {request.status}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="Audit log"
                  description="Activity history will appear here."
                  className="py-8"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
