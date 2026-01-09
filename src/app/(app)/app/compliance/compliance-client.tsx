'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  AlertTriangle,
  Shield,
  FileDown,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import Link from 'next/link'
import { toast } from 'sonner'

type CaseStage = 'INTAKE' | 'ARRANGEMENT' | 'DOCUMENTS' | 'SIGNATURES' | 'SERVICE' | 'DISPOSITION' | 'CLOSE'
type RuleSeverity = 'BLOCKER' | 'WARNING'
type RequirementType = 'DOCUMENT_EXISTS' | 'DOCUMENT_SIGNED' | 'FIELD_COMPLETED' | 'SIGNATURE_COMPLETED'
type ConditionType = 'ALWAYS' | 'DISPOSITION_EQUALS' | 'SERVICE_TYPE_EQUALS' | 'STAGE_GTE' | 'STAGE_EQUALS' | 'FIELD_PRESENT'

interface Blocker {
  id: string
  message: string
  fixAction: string | null
  fixUrl: string | null
  createdAt: Date
  case: {
    id: string
    caseNumber: string
    stage: CaseStage
    decedent: {
      firstName: string
      lastName: string
    } | null
  }
  rule: {
    id: string
    name: string
    requirementType: RequirementType
    severity: RuleSeverity
  } | null
}

interface Rule {
  id: string
  name: string
  description: string | null
  conditionType: ConditionType
  conditionField: string | null
  conditionValue: string | null
  requirementType: RequirementType
  requirementTag: string | null
  requirementField: string | null
  requiresSigned: boolean
  severity: RuleSeverity
  isActive: boolean
  _count: {
    blockers: number
  }
}

interface ComplianceClientProps {
  blockers: Blocker[]
  rules: Rule[]
}

const stageLabels: Record<CaseStage, string> = {
  INTAKE: 'Intake',
  ARRANGEMENT: 'Arrangement',
  DOCUMENTS: 'Documents',
  SIGNATURES: 'Signatures',
  SERVICE: 'Service',
  DISPOSITION: 'Disposition',
  CLOSE: 'Close',
}

const conditionLabels: Record<ConditionType, string> = {
  ALWAYS: 'Always',
  DISPOSITION_EQUALS: 'Disposition equals',
  SERVICE_TYPE_EQUALS: 'Service type equals',
  STAGE_GTE: 'Stage >= ',
  STAGE_EQUALS: 'Stage equals',
  FIELD_PRESENT: 'Field present',
}

const requirementLabels: Record<RequirementType, string> = {
  DOCUMENT_EXISTS: 'Document exists',
  DOCUMENT_SIGNED: 'Document signed',
  FIELD_COMPLETED: 'Field completed',
  SIGNATURE_COMPLETED: 'Signature completed',
}

export function ComplianceClient({ blockers, rules }: ComplianceClientProps) {
  const handleToggleRule = async (ruleId: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/compliance/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      })

      if (!res.ok) {
        throw new Error('Failed to update rule')
      }

      toast.success(`Rule ${currentState ? 'disabled' : 'enabled'}`)
      // In a real app, we'd refresh the data here
    } catch {
      toast.error('Failed to update rule')
    }
  }

  const handleExportBlockers = () => {
    // Generate CSV
    const headers = ['Case Number', 'Decedent', 'Stage', 'Rule', 'Description', 'Severity', 'Fix Action']
    const rows = blockers.map((b) => [
      b.case.caseNumber,
      b.case.decedent ? `${b.case.decedent.firstName} ${b.case.decedent.lastName}` : '',
      stageLabels[b.case.stage],
      b.rule?.name || '',
      b.message,
      b.rule?.severity || '',
      b.fixAction || '',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blocked-cases-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Export downloaded')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Compliance</h1>
          <p className="text-sm text-muted-foreground">
            Monitor blockers, manage rules, and export reports
          </p>
        </div>
        <Button onClick={() => toast.info('Rule creation coming soon')}>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      <Tabs defaultValue="blocked" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blocked">
            Blocked Cases
            {blockers.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {blockers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">
            Rules
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              {rules.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="blocked">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Blocked Cases</CardTitle>
            </CardHeader>
            <CardContent>
              {blockers.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="No blocked cases"
                  description="Cases with compliance blockers will appear here."
                  className="py-12"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockers.map((blocker) => (
                      <TableRow key={blocker.id}>
                        <TableCell>
                          <div>
                            <Link
                              href={`/app/cases/${blocker.case.id}`}
                              className="font-medium hover:underline"
                            >
                              {blocker.case.caseNumber}
                            </Link>
                            {blocker.case.decedent && (
                              <p className="text-xs text-muted-foreground">
                                {blocker.case.decedent.firstName} {blocker.case.decedent.lastName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{stageLabels[blocker.case.stage]}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {blocker.rule?.name || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {blocker.message}
                        </TableCell>
                        <TableCell>
                          <Badge variant={blocker.rule?.severity === 'BLOCKER' ? 'destructive' : 'secondary'}>
                            {blocker.rule?.severity || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {blocker.fixUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={blocker.fixUrl}>
                                Fix
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Compliance Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="No rules configured"
                  description="Create compliance rules to enforce document and signature requirements."
                  action={{
                    label: 'Create Rule',
                    onClick: () => toast.info('Rule creation coming soon'),
                  }}
                  className="py-12"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Active Blockers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            {rule.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {rule.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {conditionLabels[rule.conditionType]}
                          {rule.conditionField && ` (${rule.conditionField})`}
                          {rule.conditionValue && ` = ${rule.conditionValue}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {requirementLabels[rule.requirementType]}
                          {rule.requirementTag && `: ${rule.requirementTag}`}
                          {rule.requirementField && `: ${rule.requirementField}`}
                          {rule.requiresSigned && ' (signed)'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.severity === 'BLOCKER' ? 'destructive' : 'secondary'}>
                            {rule.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule._count.blockers > 0 ? (
                            <Badge variant="outline">{rule._count.blockers}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleRule(rule.id, rule.isActive)}
                          >
                            {rule.isActive ? (
                              <ToggleRight className="h-4 w-4 text-primary" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Reports & Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Blocked Cases Report</p>
                    <p className="text-sm text-muted-foreground">
                      Export all currently blocked cases ({blockers.length} cases)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportBlockers}
                    disabled={blockers.length === 0}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Audit Log Export</p>
                    <p className="text-sm text-muted-foreground">
                      Export audit trail for compliance review
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Audit export coming soon')}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
