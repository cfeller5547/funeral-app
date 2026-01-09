'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CaseStageBadge, BlockerCountBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { OpsTriageCopilot } from '@/components/ops-triage/ops-triage-copilot'
import { EmailInbox } from '@/components/inbox/email-inbox'
import { getPersonFullName, formatCaseNumber } from '@/types'
import type { Task, Case, Person, User, Location, Blocker, ComplianceRule, FamilyPortalSession } from '@prisma/client'

type TaskWithCase = Task & {
  case: Case & { decedent: Person | null }
}

type CaseWithRelations = Case & {
  decedent: Person | null
  director: User | null
  location?: Location
  blockers?: (Blocker & { rule: ComplianceRule })[]
  portalSessions?: FamilyPortalSession[]
  _count?: { blockers: number }
}

interface TodayBoardProps {
  myTasks: TaskWithCase[]
  todayServices: CaseWithRelations[]
  blockedCases: CaseWithRelations[]
  waitingOnFamily: CaseWithRelations[]
  upcomingCases: CaseWithRelations[]
}

export function TodayBoard({
  myTasks,
  todayServices,
  blockedCases,
  waitingOnFamily,
  upcomingCases,
}: TodayBoardProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Today</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button onClick={() => router.push('/app/cases/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </div>

      {/* Email Inbox */}
      <EmailInbox />

      {/* Board Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* My Tasks */}
        <BoardSection
          title="My Tasks"
          icon={CheckCircle2}
          count={myTasks.length}
          href="/app/tasks"
        >
          {myTasks.length === 0 ? (
            <EmptyState
              title="No tasks due today"
              description="You're all caught up!"
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {myTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </BoardSection>

        {/* Today's Services */}
        <BoardSection
          title="Today's Services"
          icon={Calendar}
          count={todayServices.length}
        >
          {todayServices.length === 0 ? (
            <EmptyState
              title="No services today"
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {todayServices.map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} showTime />
              ))}
            </div>
          )}
        </BoardSection>

        {/* Blocked Cases */}
        <BoardSection
          title="Blocked Cases"
          icon={AlertTriangle}
          count={blockedCases.length}
          variant="destructive"
          href="/app/compliance"
        >
          {blockedCases.length === 0 ? (
            <EmptyState
              title="No blocked cases"
              description="All cases are compliant"
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {blockedCases.map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} showBlockers />
              ))}
            </div>
          )}
        </BoardSection>

        {/* Waiting on Family */}
        <BoardSection
          title="Waiting on Family"
          icon={Users}
          count={waitingOnFamily.length}
        >
          {waitingOnFamily.length === 0 ? (
            <EmptyState
              title="No pending responses"
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {waitingOnFamily.map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} />
              ))}
            </div>
          )}
        </BoardSection>

        {/* Upcoming (48h) */}
        <BoardSection
          title="Upcoming (48h)"
          icon={Clock}
          count={upcomingCases.length}
        >
          {upcomingCases.length === 0 ? (
            <EmptyState
              title="No upcoming services"
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {upcomingCases.map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} showDate />
              ))}
            </div>
          )}
        </BoardSection>
      </div>

      {/* AI Ops Triage Copilot FAB */}
      <OpsTriageCopilot />
    </div>
  )
}

interface BoardSectionProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  count: number
  variant?: 'default' | 'destructive'
  href?: string
  children: React.ReactNode
}

function BoardSection({
  title,
  icon: Icon,
  count,
  variant = 'default',
  href,
  children,
}: BoardSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${
                variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
              }`}
            />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <span
              className={`text-xs font-medium ${
                variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              ({count})
            </span>
          </div>
          {href && (
            <Link href={href}>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                View all
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

function TaskCard({ task }: { task: TaskWithCase }) {
  return (
    <Link href={`/app/cases/${task.caseId}?tab=tasks`}>
      <div className="rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {getPersonFullName(task.case.decedent)} • {formatCaseNumber(task.case.caseNumber)}
            </p>
          </div>
          {task.priority === 'URGENT' && (
            <span className="text-xs text-destructive font-medium">Urgent</span>
          )}
        </div>
      </div>
    </Link>
  )
}

interface CaseCardProps {
  caseItem: CaseWithRelations
  showTime?: boolean
  showDate?: boolean
  showBlockers?: boolean
}

function CaseCard({ caseItem, showTime, showDate, showBlockers }: CaseCardProps) {
  const blockerCount = caseItem._count?.blockers || 0

  return (
    <Link href={`/app/cases/${caseItem.id}`}>
      <div className="rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {getPersonFullName(caseItem.decedent)}
              </p>
              <CaseStageBadge stage={caseItem.stage} />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCaseNumber(caseItem.caseNumber)}
              {caseItem.director && ` • ${caseItem.director.name}`}
            </p>
            {(showTime || showDate) && caseItem.serviceDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {showTime && caseItem.serviceTime
                  ? caseItem.serviceTime
                  : format(new Date(caseItem.serviceDate), showDate ? 'MMM d' : 'h:mm a')}
                {caseItem.location && ` at ${caseItem.location.name}`}
              </p>
            )}
            {showBlockers && caseItem.blockers && caseItem.blockers.length > 0 && (
              <p className="text-xs text-destructive mt-1 truncate">
                {caseItem.blockers[0].message}
              </p>
            )}
          </div>
          {blockerCount > 0 && <BlockerCountBadge count={blockerCount} />}
        </div>
      </div>
    </Link>
  )
}
