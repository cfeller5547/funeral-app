import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'

interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default async function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.95_0.02_180)] to-[oklch(0.98_0.01_180)]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[oklch(0.35_0.08_180)]">
            Welcome to FuneralOps
          </h1>
          <p className="mt-2 text-[oklch(0.5_0.03_180)]">
            Let&apos;s get your funeral home set up in a few simple steps
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
