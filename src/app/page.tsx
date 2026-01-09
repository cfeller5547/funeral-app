import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { LandingPage } from '@/components/landing/landing-page'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect('/app/today')
  }

  return <LandingPage />
}
