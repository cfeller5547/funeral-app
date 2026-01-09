'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Edit2, Image, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ReviewStepProps {
  token: string
  aboutData: Record<string, unknown>
  obituaryData: Record<string, unknown>
  participantsData: Record<string, unknown>
  uploadsData: Record<string, unknown>
}

interface UploadedFile {
  id: string
  name: string
  type: 'image' | 'document'
}

export function ReviewStep({
  token,
  aboutData,
  obituaryData,
  participantsData,
  uploadsData,
}: ReviewStepProps) {
  const router = useRouter()

  const handleContinue = async () => {
    try {
      await fetch(`/api/portal/${token}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: 'review', completed: true }),
      })
      router.push(`/f/${token}/sign`)
    } catch {
      toast.error('Failed to save. Please try again.')
    }
  }

  const files = (uploadsData.files as UploadedFile[]) || []

  return (
    <Card className="border-amber-200/50">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Review Your Information</CardTitle>
        <p className="text-sm text-gray-600">
          Please review the information you&apos;ve provided. Click Edit to make changes.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* About Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Biographical Information</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/f/${token}/about`}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <p><span className="text-gray-500">Name:</span> {String(aboutData.firstName || '-')} {String(aboutData.middleName || '')} {String(aboutData.lastName || '')}</p>
            {Boolean(aboutData.maidenName) && <p><span className="text-gray-500">Maiden Name:</span> {String(aboutData.maidenName)}</p>}
            <p><span className="text-gray-500">Date of Birth:</span> {String(aboutData.dateOfBirth || '-')}</p>
            <p><span className="text-gray-500">Date of Passing:</span> {String(aboutData.dateOfDeath || '-')}</p>
            {Boolean(aboutData.placeOfBirth) && <p><span className="text-gray-500">Place of Birth:</span> {String(aboutData.placeOfBirth)}</p>}
            {Boolean(aboutData.occupation) && <p><span className="text-gray-500">Occupation:</span> {String(aboutData.occupation)}</p>}
          </div>
        </section>

        {/* Obituary Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Obituary Information</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/f/${token}/obituary`}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            {Boolean(obituaryData.lifeStory) && (
              <div>
                <p className="text-gray-500 mb-1">Life Story:</p>
                <p className="whitespace-pre-wrap">{String(obituaryData.lifeStory).substring(0, 200)}...</p>
              </div>
            )}
            {Boolean(obituaryData.survivors) && (
              <div>
                <p className="text-gray-500 mb-1">Survivors:</p>
                <p>{String(obituaryData.survivors).substring(0, 150)}...</p>
              </div>
            )}
            {!obituaryData.lifeStory && !obituaryData.survivors && (
              <p className="text-gray-400 italic">No information provided yet</p>
            )}
          </div>
        </section>

        {/* Participants Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Service Participants</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/f/${token}/participants`}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            {Boolean(participantsData.officiant) && <p><span className="text-gray-500">Officiant:</span> {String(participantsData.officiant)}</p>}
            {Boolean(participantsData.pallbearers) && <p><span className="text-gray-500">Pallbearers:</span> {String(participantsData.pallbearers).split('\n').length} listed</p>}
            {Boolean(participantsData.eulogist) && <p><span className="text-gray-500">Eulogist:</span> {String(participantsData.eulogist)}</p>}
            {!participantsData.officiant && !participantsData.pallbearers && (
              <p className="text-gray-400 italic">No participants listed yet</p>
            )}
          </div>
        </section>

        {/* Uploads Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Uploaded Files</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/f/${token}/uploads`}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            {files.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-1 bg-white border rounded text-sm"
                  >
                    {file.type === 'image' ? (
                      <Image className="h-4 w-4 text-amber-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-amber-600" />
                    )}
                    {file.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No files uploaded</p>
            )}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" asChild className="min-h-[44px]">
            <Link href={`/f/${token}/uploads`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button
            onClick={handleContinue}
            className="min-h-[44px] bg-amber-600 hover:bg-amber-700"
          >
            Continue to Signatures
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
