'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, FileText, Loader2, PenTool } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function MockSignPage() {
  const params = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'ready' | 'signing' | 'signed' | 'declined'>('loading')

  const envelopeId = params.envelopeId as string
  const signerId = params.signerId as string

  useEffect(() => {
    // Simulate loading the document
    const timer = setTimeout(() => {
      setStatus('ready')
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleSign = async () => {
    setStatus('signing')

    try {
      // Call the mock sign endpoint
      const res = await fetch('/api/signatures/mock-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          envelopeId,
          signerId,
        }),
      })

      if (!res.ok) throw new Error('Signing failed')

      setStatus('signed')
      toast.success('Document signed successfully!')

      // Redirect after a delay
      setTimeout(() => {
        window.close()
      }, 2000)
    } catch {
      toast.error('Failed to sign document')
      setStatus('ready')
    }
  }

  const handleDecline = async () => {
    try {
      const res = await fetch('/api/signatures/mock-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          envelopeId,
          signerId,
        }),
      })

      if (!res.ok) throw new Error('Decline failed')

      setStatus('declined')
      toast.info('Document declined')

      setTimeout(() => {
        window.close()
      }, 2000)
    } catch {
      toast.error('Failed to decline')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {status === 'loading' && <Loader2 className="h-8 w-8 text-primary animate-spin" />}
            {status === 'ready' && <FileText className="h-8 w-8 text-primary" />}
            {status === 'signing' && <PenTool className="h-8 w-8 text-primary animate-pulse" />}
            {status === 'signed' && <CheckCircle2 className="h-8 w-8 text-emerald-600" />}
            {status === 'declined' && <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <CardTitle>
            {status === 'loading' && 'Loading Document...'}
            {status === 'ready' && 'Document Ready for Signature'}
            {status === 'signing' && 'Signing...'}
            {status === 'signed' && 'Document Signed!'}
            {status === 'declined' && 'Signature Declined'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <p className="text-center text-muted-foreground">
              Please wait while we load your document...
            </p>
          )}

          {status === 'ready' && (
            <div className="space-y-6">
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Demo Mode</p>
                <p className="text-sm">
                  This is a mock signing experience for demonstration purposes.
                  In production, this would be replaced by the actual e-signature provider's interface.
                </p>
              </div>

              <div className="border rounded-lg p-8 bg-white min-h-48 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Document preview would appear here</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDecline}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button className="flex-1" onClick={handleSign}>
                  <PenTool className="mr-2 h-4 w-4" />
                  Sign Document
                </Button>
              </div>
            </div>
          )}

          {status === 'signing' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Applying your signature...
              </p>
            </div>
          )}

          {status === 'signed' && (
            <div className="text-center py-4">
              <p className="text-emerald-600 mb-4">
                Your signature has been recorded successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                This window will close automatically...
              </p>
            </div>
          )}

          {status === 'declined' && (
            <div className="text-center py-4">
              <p className="text-red-600 mb-4">
                You have declined to sign this document.
              </p>
              <p className="text-sm text-muted-foreground">
                This window will close automatically...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
