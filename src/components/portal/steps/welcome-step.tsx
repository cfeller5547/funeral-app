'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface WelcomeStepProps {
  token: string
  organizationName: string
  decedentName: string
}

export function WelcomeStep({ token, organizationName, decedentName }: WelcomeStepProps) {
  return (
    <Card className="border-amber-200/50">
      <CardContent className="pt-8 pb-8">
        <div className="text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-amber-700" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome to the Family Portal
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              {organizationName} has invited you to help gather information
              to honor the memory of {decedentName}.
            </p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-medium text-amber-900 mb-2">What you&apos;ll be asked to provide:</h3>
            <ul className="text-sm text-amber-800 space-y-1 text-left">
              <li>- Biographical information</li>
              <li>- Obituary details</li>
              <li>- Service participants</li>
              <li>- Photos and documents</li>
              <li>- Digital signatures</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Your progress is saved automatically. You can return anytime.
            </p>
            <Button asChild size="lg" className="min-h-[44px] bg-amber-600 hover:bg-amber-700">
              <Link href={`/f/${token}/about`}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
