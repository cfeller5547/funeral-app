'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Mail,
  MailOpen,
  Plus,
  Link as LinkIcon,
  Trash2,
  AlertCircle,
  ChevronRight,
  Loader2,
  Inbox,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { toast } from 'sonner'

interface ParsedEmailData {
  summary: string
  isNewCaseRequest: boolean
  urgency: 'HIGH' | 'NORMAL' | 'LOW'
  suggestedAction: string
  possibleCaseNumber?: string
  keyPoints: string[]
  caseData?: any
}

interface InboundEmail {
  id: string
  fromEmail: string
  fromName: string | null
  subject: string
  bodyText: string | null
  bodyHtml: string | null
  status: 'PENDING' | 'PROCESSED' | 'LINKED' | 'IGNORED'
  parsedData: ParsedEmailData | null
  linkedCaseId: string | null
  receivedAt: string
}

interface Case {
  id: string
  caseNumber: string
  decedent?: { firstName: string; lastName: string } | null
}

interface EmailInboxProps {
  onCaseCreated?: () => void
}

const URGENCY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  LOW: 'bg-gray-100 text-gray-700',
}

export function EmailInbox({ onCaseCreated }: EmailInboxProps) {
  const [emails, setEmails] = useState<InboundEmail[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<InboundEmail | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchEmails()
    fetchCases()
  }, [])

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/inbound-emails?status=PENDING')
      if (res.ok) {
        const { data } = await res.json()
        setEmails(data)
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases?status=ACTIVE&limit=20')
      if (res.ok) {
        const { data } = await res.json()
        setCases(data)
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    }
  }

  const handleCreateCase = async (email: InboundEmail) => {
    setProcessingId(email.id)
    try {
      const res = await fetch(`/api/inbound-emails/${email.id}/create-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) throw new Error('Failed to create case')

      const { data } = await res.json()
      toast.success(`Case ${data.caseNumber} created!`)
      setEmails(emails.filter((e) => e.id !== email.id))
      setSelectedEmail(null)
      onCaseCreated?.()
    } catch {
      toast.error('Failed to create case')
    } finally {
      setProcessingId(null)
    }
  }

  const handleLinkToCase = async (email: InboundEmail, caseId: string) => {
    setProcessingId(email.id)
    try {
      const res = await fetch(`/api/inbound-emails/${email.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'link', linkedCaseId: caseId }),
      })

      if (!res.ok) throw new Error('Failed to link email')

      toast.success('Email linked to case')
      setEmails(emails.filter((e) => e.id !== email.id))
      setSelectedEmail(null)
    } catch {
      toast.error('Failed to link email')
    } finally {
      setProcessingId(null)
    }
  }

  const handleIgnore = async (email: InboundEmail) => {
    setProcessingId(email.id)
    try {
      const res = await fetch(`/api/inbound-emails/${email.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ignore' }),
      })

      if (!res.ok) throw new Error('Failed to ignore email')

      setEmails(emails.filter((e) => e.id !== email.id))
      setSelectedEmail(null)
    } catch {
      toast.error('Failed to ignore email')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Email Inbox</CardTitle>
              {emails.length > 0 && (
                <Badge variant="secondary">{emails.length}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No pending emails"
              description="Inbound emails will appear here"
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="mt-0.5">
                    {email.parsedData?.isNewCaseRequest ? (
                      <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-violet-600" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {email.fromName || email.fromEmail}
                      </p>
                      {email.parsedData?.urgency && (
                        <Badge
                          className={
                            URGENCY_COLORS[email.parsedData.urgency]
                          }
                        >
                          {email.parsedData.urgency}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground truncate">
                      {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {email.parsedData?.summary || 'No summary available'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(email.receivedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Detail Sheet */}
      <Sheet
        open={!!selectedEmail}
        onOpenChange={() => setSelectedEmail(null)}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedEmail && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedEmail.subject}</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Sender info */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedEmail.fromName || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmail.fromEmail}
                    </p>
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedEmail.parsedData && (
                  <Card className="bg-violet-50 border-violet-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-600" />
                        <CardTitle className="text-sm font-medium text-violet-900">
                          AI Analysis
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-violet-800">
                        {selectedEmail.parsedData.summary}
                      </p>

                      {selectedEmail.parsedData.keyPoints.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-violet-700 mb-1">
                            Key Points:
                          </p>
                          <ul className="text-sm text-violet-800 list-disc list-inside space-y-0.5">
                            {selectedEmail.parsedData.keyPoints.map(
                              (point, i) => (
                                <li key={i}>{point}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            URGENCY_COLORS[selectedEmail.parsedData.urgency]
                          }
                        >
                          {selectedEmail.parsedData.urgency} Priority
                        </Badge>
                        {selectedEmail.parsedData.isNewCaseRequest && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            New Case Request
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Email body */}
                <div>
                  <p className="text-sm font-medium mb-2">Message</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {selectedEmail.bodyText || 'No content'}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t">
                  {selectedEmail.parsedData?.isNewCaseRequest && (
                    <Button
                      className="w-full"
                      onClick={() => handleCreateCase(selectedEmail)}
                      disabled={processingId === selectedEmail.id}
                    >
                      {processingId === selectedEmail.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Create New Case
                    </Button>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">
                      Link to Existing Case
                    </p>
                    <Select
                      onValueChange={(value) =>
                        handleLinkToCase(selectedEmail, value)
                      }
                      disabled={processingId === selectedEmail.id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a case..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.caseNumber} -{' '}
                            {c.decedent
                              ? `${c.decedent.firstName} ${c.decedent.lastName}`
                              : 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleIgnore(selectedEmail)}
                    disabled={processingId === selectedEmail.id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Ignore Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
