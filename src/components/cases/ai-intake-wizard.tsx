'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  FileText,
  User,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Edit3,
  HelpCircle,
  Copy,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import type { ExtractedCaseData, ExtractedContact } from '@/lib/ai'

type Step = 'input' | 'review' | 'create'

export function AIIntakeWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedCaseData | null>(null)
  const [editedData, setEditedData] = useState<ExtractedCaseData | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleExtract = async () => {
    if (!notes.trim()) {
      toast.error('Please enter intake notes')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/ai/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to extract data')
      }

      const data = await response.json()
      setExtractedData(data)
      setEditedData(data)
      setStep('review')
    } catch (error) {
      toast.error('Failed to extract data. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateCase = async () => {
    if (!editedData) return

    setIsCreating(true)
    try {
      // Create the case with extracted data
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decedent: editedData.decedent,
          contacts: editedData.contacts,
          service: editedData.service,
          notes: editedData.notes,
          source: 'ai_intake',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create case')
      }

      const caseData = await response.json()
      toast.success('Case created successfully!')
      router.push(`/app/cases/${caseData.id}`)
    } catch (error) {
      toast.error('Failed to create case. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const ConfidenceBadge = ({ confidence }: { confidence: 'high' | 'medium' | 'low' }) => {
    const colors = {
      high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-red-100 text-red-700 border-red-200',
    }
    return (
      <Badge variant="outline" className={`${colors[confidence]} text-xs`}>
        {confidence} confidence
      </Badge>
    )
  }

  if (step === 'input') {
    return (
      <div className="space-y-6">
        {/* Input Section */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Paste Your Notes</h2>
              <p className="text-sm text-gray-500">
                Copy and paste notes from phone calls, emails, faxes, or other sources.
                AI will extract all relevant case details.
              </p>
            </div>
          </div>

          <Textarea
            placeholder={`Example:
Got a call from Mary Johnson about her husband Robert Johnson who passed away this morning at St. Mary's Hospital.

Robert was born March 15, 1945, SSN ending in 4532. They live at 123 Oak Street, Springfield, IL 62701.

Mary's phone is 555-123-4567, email mary.johnson@email.com. She's the wife and will be handling arrangements.

They want a traditional service with burial at Riverside Cemetery. Thinking Saturday at 2pm.

Mary mentioned her son David (555-987-6543) will help with arrangements too.`}
            className="min-h-[300px] font-mono text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {notes.length} characters
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/app/cases/new')}>
                Cancel
              </Button>
              <Button
                onClick={handleExtract}
                disabled={isProcessing || !notes.trim()}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extract Details
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Tips for best results
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Include full names, dates, and contact information</li>
            <li>• Mention relationships (wife, son, daughter, etc.)</li>
            <li>• Note service preferences (traditional, cremation, memorial)</li>
            <li>• Add any special requests or notes from the family</li>
          </ul>
        </Card>
      </div>
    )
  }

  if (step === 'review' && editedData) {
    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            Input
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <div className="flex items-center gap-2 text-violet-600 font-medium">
            <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center">
              2
            </div>
            Review & Confirm
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
              3
            </div>
            Create Case
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Decedent Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Decedent Information</h3>
                    <ConfidenceBadge confidence={editedData.decedent.confidence} />
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">First Name</Label>
                  <Input
                    value={editedData.decedent.firstName || ''}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        decedent: { ...editedData.decedent, firstName: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Name</Label>
                  <Input
                    value={editedData.decedent.lastName || ''}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        decedent: { ...editedData.decedent, lastName: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Date of Birth</Label>
                  <Input
                    type="date"
                    value={editedData.decedent.dateOfBirth || ''}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        decedent: { ...editedData.decedent, dateOfBirth: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Date of Death</Label>
                  <Input
                    type="date"
                    value={editedData.decedent.dateOfDeath || ''}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        decedent: { ...editedData.decedent, dateOfDeath: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs text-gray-500">Place of Death</Label>
                  <Input
                    value={editedData.decedent.placeOfDeath || ''}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        decedent: { ...editedData.decedent, placeOfDeath: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs text-gray-500">Address</Label>
                  <Input
                    value={editedData.decedent.address || ''}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        decedent: { ...editedData.decedent, address: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">City</Label>
                  <Input
                    value={editedData.decedent.city || ''}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        decedent: { ...editedData.decedent, city: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">State</Label>
                    <Input
                      value={editedData.decedent.state || ''}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          decedent: { ...editedData.decedent, state: e.target.value },
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">ZIP</Label>
                    <Input
                      value={editedData.decedent.zipCode || ''}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          decedent: { ...editedData.decedent, zipCode: e.target.value },
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Contacts Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Contacts</h3>
                    <p className="text-sm text-gray-500">
                      {editedData.contacts.length} contact(s) found
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {editedData.contacts.map((contact, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.isPrimary && (
                          <Badge className="bg-violet-100 text-violet-700">Primary</Badge>
                        )}
                        <ConfidenceBadge confidence={contact.confidence} />
                      </div>
                      <Select
                        value={contact.role}
                        onValueChange={(value) => {
                          const newContacts = [...editedData.contacts]
                          newContacts[index] = { ...contact, role: value as ExtractedContact['role'] }
                          setEditedData({ ...editedData, contacts: newContacts })
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEXT_OF_KIN">Next of Kin</SelectItem>
                          <SelectItem value="INFORMANT">Informant</SelectItem>
                          <SelectItem value="PURCHASER">Purchaser</SelectItem>
                          <SelectItem value="AUTHORIZED_AGENT">Authorized Agent</SelectItem>
                          <SelectItem value="CLERGY">Clergy</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      {contact.relationship && (
                        <div>
                          <span className="text-gray-500">Relationship:</span>{' '}
                          <span className="text-gray-900">{contact.relationship}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div>
                          <span className="text-gray-500">Phone:</span>{' '}
                          <span className="text-gray-900">{contact.phone}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div>
                          <span className="text-gray-500">Email:</span>{' '}
                          <span className="text-gray-900">{contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Service Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Service Details</h3>
                    <ConfidenceBadge confidence={editedData.service.confidence} />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Service Type</Label>
                  <Select
                    value={editedData.service.serviceType || ''}
                    onValueChange={(value) =>
                      setEditedData({
                        ...editedData,
                        service: { ...editedData.service, serviceType: value as any },
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRADITIONAL">Traditional</SelectItem>
                      <SelectItem value="MEMORIAL">Memorial</SelectItem>
                      <SelectItem value="GRAVESIDE">Graveside</SelectItem>
                      <SelectItem value="DIRECT_CREMATION">Direct Cremation</SelectItem>
                      <SelectItem value="DIRECT_BURIAL">Direct Burial</SelectItem>
                      <SelectItem value="CELEBRATION_OF_LIFE">Celebration of Life</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Disposition</Label>
                  <Select
                    value={editedData.service.disposition || ''}
                    onValueChange={(value) =>
                      setEditedData({
                        ...editedData,
                        service: { ...editedData.service, disposition: value as any },
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select disposition..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BURIAL">Burial</SelectItem>
                      <SelectItem value="CREMATION">Cremation</SelectItem>
                      <SelectItem value="ENTOMBMENT">Entombment</SelectItem>
                      <SelectItem value="DONATION">Donation</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Service Date</Label>
                  <Input
                    type="date"
                    value={editedData.service.serviceDate || ''}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        service: { ...editedData.service, serviceDate: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Service Time</Label>
                  <Input
                    value={editedData.service.serviceTime || ''}
                    placeholder="e.g., 2:00 PM"
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        service: { ...editedData.service, serviceTime: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs text-gray-500">Service Location</Label>
                  <Input
                    value={editedData.service.serviceLocation || ''}
                    placeholder="e.g., Chapel A, Riverside Cemetery"
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        service: { ...editedData.service, serviceLocation: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="space-y-6">
            {/* Missing Info */}
            {editedData.missingInfo.length > 0 && (
              <Card className="p-4 border-amber-200 bg-amber-50">
                <h3 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Missing Information
                </h3>
                <ul className="space-y-2">
                  {editedData.missingInfo.map((item, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Questions for Family */}
            {editedData.questionsForFamily.length > 0 && (
              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-blue-900 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Questions for Family
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy all questions</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ul className="space-y-2">
                  {editedData.questionsForFamily.map((question, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="font-medium text-blue-600">{index + 1}.</span>
                      {question}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Notes */}
            {editedData.notes && (
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Notes
                </h3>
                <p className="text-sm text-gray-600">{editedData.notes}</p>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <h3 className="font-medium text-gray-900 mb-4">Ready to create case?</h3>
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  onClick={handleCreateCase}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Case...
                    </>
                  ) : (
                    <>
                      Create Case
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('input')}
                >
                  Back to Notes
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return null
}
