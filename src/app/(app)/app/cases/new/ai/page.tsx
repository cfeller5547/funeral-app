import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { AIIntakeWizard } from '@/components/cases/ai-intake-wizard'

export default async function AIIntakePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Intake Copilot</h1>
        <p className="text-gray-500 mt-1">
          Paste your intake notes and let AI extract case details instantly
        </p>
      </div>

      <AIIntakeWizard />
    </div>
  )
}
