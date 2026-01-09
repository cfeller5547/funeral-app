import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { TodayBoard } from '@/components/today/today-board'

export default async function TodayPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const twoDaysFromNow = new Date(today)
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

  // Fetch data for Today Board sections
  const [myTasks, todayServices, blockedCases, waitingOnFamily, upcomingCases] = await Promise.all([
    // My Tasks due today
    prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        status: 'OPEN',
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        case: {
          include: {
            decedent: true,
          },
        },
      },
      orderBy: {
        priority: 'desc',
      },
      take: 10,
    }),
    // Today's Services
    prisma.case.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: 'ACTIVE',
        serviceDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        decedent: true,
        director: true,
        location: true,
        _count: {
          select: {
            blockers: {
              where: { isResolved: false },
            },
          },
        },
      },
      orderBy: {
        serviceDate: 'asc',
      },
    }),
    // Blocked Cases
    prisma.case.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: 'ACTIVE',
        blockers: {
          some: {
            isResolved: false,
          },
        },
      },
      include: {
        decedent: true,
        director: true,
        blockers: {
          where: { isResolved: false },
          include: { rule: true },
          take: 3,
        },
        _count: {
          select: {
            blockers: {
              where: { isResolved: false },
            },
          },
        },
      },
      take: 10,
    }),
    // Waiting on Family (cases with pending portal sessions)
    prisma.case.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: 'ACTIVE',
        portalSessions: {
          some: {
            status: {
              in: ['NOT_STARTED', 'IN_PROGRESS'],
            },
          },
        },
      },
      include: {
        decedent: true,
        director: true,
        portalSessions: {
          where: {
            status: {
              in: ['NOT_STARTED', 'IN_PROGRESS'],
            },
          },
        },
        _count: {
          select: {
            blockers: {
              where: { isResolved: false },
            },
          },
        },
      },
      take: 10,
    }),
    // Upcoming (next 48 hours)
    prisma.case.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: 'ACTIVE',
        serviceDate: {
          gt: tomorrow,
          lte: twoDaysFromNow,
        },
      },
      include: {
        decedent: true,
        director: true,
        location: true,
        _count: {
          select: {
            blockers: {
              where: { isResolved: false },
            },
          },
        },
      },
      orderBy: {
        serviceDate: 'asc',
      },
      take: 10,
    }),
  ])

  return (
    <TodayBoard
      myTasks={myTasks}
      todayServices={todayServices}
      blockedCases={blockedCases}
      waitingOnFamily={waitingOnFamily}
      upcomingCases={upcomingCases}
    />
  )
}
