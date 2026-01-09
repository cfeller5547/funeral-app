import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import Link from 'next/link'
import {
  Sparkles,
  FileText,
  Mail,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export default async function NewCasePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Case</h1>
        <p className="text-gray-500 mt-1">Choose how you want to start</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Intake - Featured */}
        <Link
          href="/app/cases/new/ai"
          className="group relative md:col-span-2 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8 hover:border-violet-400 hover:shadow-lg transition-all"
        >
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              <Zap className="h-3 w-3" />
              Recommended
            </span>
          </div>

          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                AI Intake Copilot
                <ArrowRight className="h-5 w-5 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-gray-600 mb-4">
                Paste notes from phone calls, emails, or faxes. AI extracts all case details in
                seconds — names, dates, contacts, service preferences.
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-violet-700">
                  <Clock className="h-4 w-4" />
                  Save 10+ minutes per case
                </div>
                <div className="flex items-center gap-1.5 text-violet-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Auto-extracts contacts
                </div>
                <div className="flex items-center gap-1.5 text-violet-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Identifies missing info
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Form */}
        <Link
          href="/app/cases/new/manual"
          className="group rounded-xl border border-gray-200 bg-white p-6 hover:border-gray-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                Quick Form
                <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-gray-500 text-sm">
                Manually enter case details with a simple form. Best when you have structured information ready.
              </p>
            </div>
          </div>
        </Link>

        {/* Inbound Email */}
        <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-6 opacity-60 cursor-not-allowed">
          <div className="absolute top-3 right-3">
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Coming Soon</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-200 flex items-center justify-center">
              <Mail className="h-6 w-6 text-gray-400" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-500 mb-1">
                From Email
              </h2>
              <p className="text-gray-400 text-sm">
                Import from forwarded emails in your inbox queue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
