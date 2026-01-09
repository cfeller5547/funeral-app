'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Shield,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Heart,
  Star,
  Play,
} from 'lucide-react'

const features = [
  {
    icon: ClipboardList,
    title: 'Case Management',
    description:
      'Track every case from first call to final disposition with a clear, stage-based workflow.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'Document Generation',
    description:
      'Auto-generate contracts, authorizations, and forms with merge fields. E-signatures built in.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Shield,
    title: 'Compliance Engine',
    description:
      'Never miss a required document. Automatic blockers ensure regulatory compliance.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    title: 'Family Portal',
    description:
      'Let families provide information, upload photos, and sign documents from any device.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Clock,
    title: 'Today Board',
    description:
      'Start each day knowing exactly what needs attention. Tasks, services, and blockers at a glance.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Sparkles,
    title: 'AI Intake',
    description:
      'Paste arrangement notes and let AI extract decedent info, contacts, and service details.',
    gradient: 'from-pink-500 to-rose-500',
  },
]

const testimonials = [
  {
    quote:
      'FuneralOps transformed how we manage cases. What used to take hours of paperwork now happens automatically.',
    author: 'Sarah Mitchell',
    role: 'Owner, Peaceful Rest Funeral Home',
    rating: 5,
    avatar: 'SM',
  },
  {
    quote:
      'The family portal is a game-changer. Families can contribute information on their own time, and everything syncs perfectly.',
    author: 'James Wilson',
    role: 'Director, Willow Creek Services',
    rating: 5,
    avatar: 'JW',
  },
  {
    quote:
      "Compliance used to keep me up at night. Now I have peace of mind knowing nothing slips through the cracks.",
    author: 'Maria Garcia',
    role: 'Administrator, Heritage Memorial',
    rating: 5,
    avatar: 'MG',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Full Color Background */}
      <div className="relative bg-gradient-to-br from-[#005a63] via-[#006D77] to-[#008891] overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-100" />

        {/* Gradient orbs for depth */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl" />

        {/* Header */}
        <header className="relative z-50">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">FuneralOps</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Pricing
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="font-medium text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-white text-[#006D77] hover:bg-white/90 font-semibold shadow-lg shadow-black/10">
                <Link href="/login">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <section className="relative pt-16 pb-32 sm:pt-24 sm:pb-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 mb-8">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                Trusted by 500+ funeral homes nationwide
              </div>

              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl leading-[1.1]">
                Modern Case Management for{' '}
                <span className="text-teal-200">
                  Funeral Professionals
                </span>
              </h1>
              <p className="mt-8 text-xl leading-8 text-teal-100 max-w-2xl mx-auto">
                Streamline your workflow, ensure compliance, and provide families with a dignified
                digital experience. Focus on what matters while we handle the details.
              </p>
              <div className="mt-12">
                <Button size="lg" asChild className="bg-white text-[#006D77] hover:bg-white/90 shadow-xl shadow-black/20 font-semibold h-14 px-10 text-base">
                  <Link href="/login">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-teal-200 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-300" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-300" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-300" />
                  Cancel anytime
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Product Mockup - Floating out of hero */}
      <section className="relative -mt-20 sm:-mt-32 pb-20 sm:pb-32">
        <div className="mx-auto max-w-[90%] xl:max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative group cursor-pointer">
            {/* Glow effect behind the mockup */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/30 via-cyan-400/30 to-teal-400/30 blur-3xl -z-10 scale-105" />

            {/* Blur Overlay - Only on hover */}
            <div className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Play Button - Always visible */}
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <button className="pointer-events-auto flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/90 backdrop-blur-sm shadow-2xl group-hover:scale-110 transition-all duration-300 ring-4 ring-white/30">
                <Play className="h-8 w-8 sm:h-10 sm:w-10 text-[#006D77] fill-[#006D77] ml-1" />
              </button>
            </div>

            {/* "Watch Demo" label - Always visible */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
              <span className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-semibold shadow-lg">
                Watch Demo
              </span>
            </div>

            {/* Browser Frame */}
            <div className="rounded-2xl bg-gray-900 shadow-2xl shadow-gray-900/50 overflow-hidden ring-1 ring-white/10">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-700 rounded-md px-3 py-1.5 text-xs text-gray-400 flex items-center gap-2 max-w-md mx-auto">
                    <Shield className="h-3 w-3" />
                    app.funeralops.com/today
                  </div>
                </div>
              </div>

              {/* App Content */}
              <div className="bg-[#EDF6F9] p-5 sm:p-8 min-h-[500px] sm:min-h-[600px]">
                <div className="flex gap-5 sm:gap-8 h-full">
                  {/* Sidebar */}
                  <div className="hidden sm:flex sm:flex-col w-56 bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">FuneralOps</span>
                    </div>
                    <nav className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-teal-50 text-teal-700 rounded-lg font-medium">
                        <Clock className="h-5 w-5" />
                        Today
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <ClipboardList className="h-5 w-5" />
                        Cases
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5" />
                        Documents
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5" />
                        Families
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <Shield className="h-5 w-5" />
                        Compliance
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <Sparkles className="h-5 w-5" />
                        AI Intake
                      </div>
                    </nav>
                    {/* User Profile */}
                    <div className="mt-auto pt-5 border-t border-gray-100">
                      <div className="flex items-center gap-3 px-2">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                          JD
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">Jane Doe</div>
                          <div className="text-xs text-gray-500 truncate">Peaceful Rest</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Today&apos;s Board</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Wednesday, January 15, 2025</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                          <div className="w-4 h-4 rounded-full bg-gray-300" />
                          <span className="text-sm text-gray-500">Search...</span>
                        </div>
                        <div className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-teal-700 cursor-pointer">
                          + New Case
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">My Tasks</div>
                        <div className="text-3xl font-bold text-gray-900">8</div>
                        <div className="text-sm text-amber-600 mt-1 font-medium">3 due today</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Services</div>
                        <div className="text-3xl font-bold text-gray-900">2</div>
                        <div className="text-sm text-teal-600 mt-1 font-medium">Today</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Active Cases</div>
                        <div className="text-3xl font-bold text-gray-900">12</div>
                        <div className="text-sm text-gray-400 mt-1">In progress</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Blockers</div>
                        <div className="text-3xl font-bold text-red-600">2</div>
                        <div className="text-sm text-red-600 mt-1 font-medium">Need attention</div>
                      </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid lg:grid-cols-3 gap-5">
                      {/* Cases Column */}
                      <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Active Cases</h3>
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="font-semibold text-gray-900">Margaret Thompson</div>
                                <div className="text-sm text-gray-500">Case #2025-0042 • Cremation</div>
                              </div>
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Documents</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                Service: Jan 18, 2:00 PM
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                Wilson Family
                              </span>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">2 signatures pending</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="font-semibold text-gray-900">Robert Chen</div>
                                <div className="text-sm text-gray-500">Case #2025-0041 • Traditional</div>
                              </div>
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Service</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                Service: Today, 10:00 AM
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                Chen Family
                              </span>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">All documents complete</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="font-semibold text-gray-900">Patricia Williams</div>
                                <div className="text-sm text-gray-500">Case #2025-0040 • Direct Cremation</div>
                              </div>
                              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Arrangement</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                No service scheduled
                              </span>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">Portal link sent</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tasks Column */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Today&apos;s Tasks</h3>
                        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-5 h-5 rounded border-2 border-amber-400 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Call florist for Thompson</div>
                              <div className="text-xs text-amber-600">Due in 2 hours</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Confirm Chen family arrival</div>
                              <div className="text-xs text-gray-500">Due at 9:00 AM</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-5 h-5 rounded bg-teal-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-400 line-through">Send death certificates</div>
                              <div className="text-xs text-gray-400">Completed</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Review Williams intake</div>
                              <div className="text-xs text-gray-500">Due today</div>
                            </div>
                          </div>
                        </div>

                        {/* Upcoming Services */}
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide pt-2">Upcoming Services</h3>
                        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-teal-50 flex flex-col items-center justify-center">
                              <span className="text-xs font-bold text-teal-700">JAN</span>
                              <span className="text-lg font-bold text-teal-700 -mt-1">15</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Robert Chen</div>
                              <div className="text-xs text-gray-500">10:00 AM • Chapel A</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                              <span className="text-xs font-bold text-gray-500">JAN</span>
                              <span className="text-lg font-bold text-gray-700 -mt-1">18</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Margaret Thompson</div>
                              <div className="text-xs text-gray-500">2:00 PM • Chapel B</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Everything You Need to Run a Modern Funeral Home
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              Built by funeral professionals for funeral professionals. Every feature designed to
              save time and reduce stress.
            </p>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-gray-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1"
                >
                  <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-gradient-to-r from-[oklch(0.40_0.12_180)] via-[oklch(0.45_0.12_180)] to-[oklch(0.50_0.12_180)] py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { stat: '500+', label: 'Funeral Homes', icon: '🏛️' },
              { stat: '50,000+', label: 'Cases Managed', icon: '📋' },
              { stat: '99.9%', label: 'Uptime', icon: '⚡' },
              { stat: '4.9/5', label: 'Customer Rating', icon: '⭐' },
            ].map((item) => (
              <div key={item.label} className="text-center group">
                <div className="text-5xl font-bold text-white mb-2">{item.stat}</div>
                <div className="text-sm font-medium text-white/80 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Trusted by Funeral Homes Nationwide
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              See why hundreds of funeral professionals choose FuneralOps
            </p>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="relative rounded-2xl bg-gradient-to-b from-gray-50 to-white p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Quote mark */}
                <div className="absolute -top-4 left-6 text-6xl text-teal-100 font-serif">&ldquo;</div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed relative z-10">{testimonial.quote}</p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              No hidden fees. No long-term contracts. Pay only for what you need.
            </p>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-8 lg:grid-cols-2">
            {/* Starter Plan */}
            <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Starter</h3>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Small Teams</span>
              </div>
              <p className="mt-3 text-gray-500">Perfect for smaller funeral homes getting started</p>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-gray-900">$99</span>
                <span className="text-lg text-gray-500">/month</span>
              </div>
              <ul className="mt-10 space-y-4">
                {[
                  'Up to 25 cases/month',
                  'Single location',
                  '3 team members',
                  'Document generation',
                  'Family portal',
                  'Email support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-10 w-full h-12 text-base font-semibold" variant="outline" asChild>
                <Link href="/login">Start Free Trial</Link>
              </Button>
            </div>

            {/* Professional Plan */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[oklch(0.45_0.12_180)] to-[oklch(0.40_0.12_180)] p-10 shadow-2xl shadow-teal-500/20">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  Most Popular
                </span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Professional</h3>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">Best Value</span>
              </div>
              <p className="mt-3 text-teal-100">For growing funeral homes that need more</p>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-white">$249</span>
                <span className="text-lg text-teal-200">/month</span>
              </div>
              <ul className="mt-10 space-y-4">
                {[
                  'Unlimited cases',
                  'Multiple locations',
                  'Unlimited team members',
                  'Advanced compliance',
                  'E-signature integration',
                  'AI intake assistant',
                  'Priority support',
                  'Custom branding',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-teal-50">
                    <CheckCircle2 className="h-5 w-5 text-teal-300 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-10 w-full h-12 text-base font-semibold bg-white text-[oklch(0.45_0.12_180)] hover:bg-gray-100" asChild>
                <Link href="/login">Start Free Trial</Link>
              </Button>
            </div>
          </div>

          <p className="text-center mt-12 text-gray-500">
            Need a custom plan for enterprise? <a href="#" className="text-teal-600 font-medium hover:underline">Contact our sales team</a>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.40_0.12_180)] via-[oklch(0.45_0.12_180)] to-[oklch(0.50_0.15_180)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white sm:text-5xl leading-tight">
            Ready to Modernize Your Funeral Home?
          </h2>
          <p className="mt-6 text-xl text-teal-100 max-w-2xl mx-auto">
            Join hundreds of funeral professionals who trust FuneralOps to streamline their operations and serve families better.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-[oklch(0.45_0.12_180)] hover:bg-gray-100 shadow-xl font-semibold h-12 px-8 text-base" asChild>
              <Link href="/login">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold h-12 px-8 text-base" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-teal-200">
            No credit card required. Get started in under 5 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FuneralOps</span>
              </div>
              <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                Modern case management software built specifically for funeral professionals.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} FuneralOps. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span className="text-sm text-gray-500">for funeral professionals</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
