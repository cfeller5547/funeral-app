'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, ArrowRight, FileText, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DocumentToSign {
  id: string
  name: string
  tag: string
  status: string
}

interface SignStepProps {
  token: string
  documentsToSign: DocumentToSign[]
}

export function SignStep({ token, documentsToSign }: SignStepProps) {
  const router = useRouter()
  const [signedDocs, setSignedDocs] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSignDocument = async (docId: string) => {
    setIsProcessing(true)
    try {
      // In demo mode, simulate signing
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSignedDocs((prev) => new Set([...prev, docId]))
      toast.success('Document signed successfully')
    } catch {
      toast.error('Failed to sign document')
    } finally {
      setIsProcessing(false)
    }
  }

  const allDocsSigned = documentsToSign.length === 0 || signedDocs.size === documentsToSign.length

  const handleContinue = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms to continue')
      return
    }

    try {
      await fetch(`/api/portal/${token}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: 'sign', completed: true }),
      })
      // Mark portal as completed
      await fetch(`/api/portal/${token}/complete`, {
        method: 'POST',
      })
      router.push(`/f/${token}/confirmation`)
    } catch {
      toast.error('Failed to save. Please try again.')
    }
  }

  return (
    <Card className="border-amber-200/50">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Sign Documents</CardTitle>
        <p className="text-sm text-gray-600">
          Please review and sign the following documents electronically.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {documentsToSign.length > 0 ? (
          <div className="space-y-4">
            {documentsToSign.map((doc) => {
              const isSigned = signedDocs.has(doc.id)
              return (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isSigned ? 'bg-green-50 border-green-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`h-8 w-8 ${isSigned ? 'text-green-600' : 'text-amber-600'}`} />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {isSigned ? 'Signed' : 'Requires your signature'}
                      </p>
                    </div>
                  </div>
                  {isSigned ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Signed</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSignDocument(doc.id)}
                      disabled={isProcessing}
                      className="min-h-[44px] bg-amber-600 hover:bg-amber-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Sign Document'
                      )}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents require your signature at this time.</p>
          </div>
        )}

        {/* Agreement */}
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-1"
            />
            <label htmlFor="agreement" className="text-sm text-amber-900">
              I confirm that the information provided is accurate to the best of my knowledge.
              I understand that electronic signatures have the same legal effect as handwritten signatures.
            </label>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" asChild className="min-h-[44px]">
            <Link href={`/f/${token}/review`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!allDocsSigned || !agreed}
            className="min-h-[44px] bg-amber-600 hover:bg-amber-700"
          >
            Complete
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
