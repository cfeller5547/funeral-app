'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Phone, Mail, Heart } from 'lucide-react'

interface ConfirmationStepProps {
  organizationName: string
  organizationPhone: string | null
  organizationEmail: string | null
  decedentName: string
}

export function ConfirmationStep({
  organizationName,
  organizationPhone,
  organizationEmail,
  decedentName,
}: ConfirmationStepProps) {
  return (
    <Card className="border-amber-200/50">
      <CardContent className="pt-8 pb-8">
        <div className="text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Thank You
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Your information has been received. The team at {organizationName} will
              use this to honor the memory of {decedentName}.
            </p>
          </div>

          <div className="bg-amber-50 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-medium text-amber-900 mb-4">What happens next?</h3>
            <ul className="text-sm text-amber-800 space-y-3 text-left">
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">1.</span>
                <span>Our team will review the information you provided</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">2.</span>
                <span>We&apos;ll prepare the obituary and service materials</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">3.</span>
                <span>You&apos;ll receive a copy for your approval</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">4.</span>
                <span>We&apos;re here if you have any questions</span>
              </li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Questions? Contact us:</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {organizationPhone && (
                <a
                  href={`tel:${organizationPhone}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px]"
                >
                  <Phone className="h-5 w-5 text-amber-600" />
                  <span className="text-gray-900">{organizationPhone}</span>
                </a>
              )}
              {organizationEmail && (
                <a
                  href={`mailto:${organizationEmail}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px]"
                >
                  <Mail className="h-5 w-5 text-amber-600" />
                  <span className="text-gray-900">{organizationEmail}</span>
                </a>
              )}
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Heart className="h-4 w-4" />
              <span className="text-sm">With sympathy, {organizationName}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
