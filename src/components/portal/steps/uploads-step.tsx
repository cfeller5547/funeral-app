'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Upload, Image, FileText, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface UploadsStepProps {
  token: string
  initialData: Record<string, unknown>
}

interface UploadedFile {
  id: string
  name: string
  type: 'image' | 'document'
  url: string
}

export function UploadsStep({ token, initialData }: UploadsStepProps) {
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>(
    (initialData.files as UploadedFile[]) || []
  )
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    setIsUploading(true)

    // In demo mode, simulate upload
    const newFiles: UploadedFile[] = []
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const isImage = file.type.startsWith('image/')

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      newFiles.push({
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        type: isImage ? 'image' : 'document',
        url: URL.createObjectURL(file), // In production, this would be S3 URL
      })
    }

    setFiles((prev) => [...prev, ...newFiles])
    setIsUploading(false)
    toast.success(`${newFiles.length} file(s) uploaded`)
  }, [])

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleContinue = async () => {
    try {
      await fetch(`/api/portal/${token}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'uploads', data: { files } }),
      })
      await fetch(`/api/portal/${token}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: 'uploads', completed: true }),
      })
      router.push(`/f/${token}/review`)
    } catch {
      toast.error('Failed to save. Please try again.')
    }
  }

  return (
    <Card className="border-amber-200/50">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Photos & Documents</CardTitle>
        <p className="text-sm text-gray-600">
          Upload photos for the memorial slideshow and any important documents.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center bg-amber-50/50">
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-amber-600 mb-4" />
            <p className="font-medium text-gray-900">
              {isUploading ? 'Uploading...' : 'Click to upload files'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Photos (JPG, PNG) and documents (PDF, DOC)
            </p>
          </label>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Uploaded Files ({files.length})</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                >
                  {file.type === 'image' ? (
                    <Image className="h-8 w-8 text-amber-600 flex-shrink-0" />
                  ) : (
                    <FileText className="h-8 w-8 text-amber-600 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-900 truncate flex-1">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(file.id)}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-amber-50 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 mb-2">Tips for photos:</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>- Include photos from different stages of life</li>
            <li>- Family gatherings and special occasions</li>
            <li>- Hobbies and activities they enjoyed</li>
            <li>- Military or professional photos if applicable</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" asChild className="min-h-[44px]">
            <Link href={`/f/${token}/participants`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button
            onClick={handleContinue}
            className="min-h-[44px] bg-amber-600 hover:bg-amber-700"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
