'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ArrowRight,
  FileImage,
  File,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { DocumentAnalysis } from '@/lib/ai'

interface SmartUploadProps {
  caseId?: string
  onUploadComplete?: () => void
}

interface FileWithAnalysis {
  file: File
  preview: string
  status: 'pending' | 'analyzing' | 'analyzed' | 'error'
  analysis?: DocumentAnalysis & { originalFilename: string }
  error?: string
}

const TAG_LABELS: Record<string, string> = {
  GPL: 'General Price List',
  CONTRACT: 'Contract',
  AUTHORIZATION_CREMATION: 'Cremation Authorization',
  AUTHORIZATION_EMBALMING: 'Embalming Authorization',
  AUTHORIZATION_DISPOSITION: 'Disposition Authorization',
  PERMIT_BURIAL: 'Burial Permit',
  PERMIT_TRANSIT: 'Transit Permit',
  DEATH_CERTIFICATE: 'Death Certificate',
  ID_VERIFICATION: 'ID Verification',
  OBITUARY: 'Obituary',
  PROGRAM: 'Program',
  CHECKLIST: 'Checklist',
  OTHER: 'Other',
}

const TAG_COLORS: Record<string, string> = {
  GPL: 'bg-blue-100 text-blue-700',
  CONTRACT: 'bg-purple-100 text-purple-700',
  AUTHORIZATION_CREMATION: 'bg-amber-100 text-amber-700',
  AUTHORIZATION_EMBALMING: 'bg-amber-100 text-amber-700',
  AUTHORIZATION_DISPOSITION: 'bg-amber-100 text-amber-700',
  PERMIT_BURIAL: 'bg-emerald-100 text-emerald-700',
  PERMIT_TRANSIT: 'bg-emerald-100 text-emerald-700',
  DEATH_CERTIFICATE: 'bg-red-100 text-red-700',
  ID_VERIFICATION: 'bg-gray-100 text-gray-700',
  OBITUARY: 'bg-indigo-100 text-indigo-700',
  PROGRAM: 'bg-pink-100 text-pink-700',
  CHECKLIST: 'bg-cyan-100 text-cyan-700',
  OTHER: 'bg-gray-100 text-gray-700',
}

export function SmartUpload({ caseId, onUploadComplete }: SmartUploadProps) {
  const router = useRouter()
  const [files, setFiles] = useState<FileWithAnalysis[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileWithAnalysis | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf'
    )

    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (f) => f.type.startsWith('image/') || f.type === 'application/pdf'
      )
      addFiles(selectedFiles)
    }
  }

  const addFiles = async (newFiles: File[]) => {
    const filePromises = newFiles.map(async (file) => {
      const preview = await getFilePreview(file)
      return {
        file,
        preview,
        status: 'pending' as const,
      }
    })

    const newFileEntries = await Promise.all(filePromises)
    setFiles((prev) => [...prev, ...newFileEntries])
  }

  const getFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve('/pdf-icon.png') // Placeholder for PDFs
      }
    })
  }

  const analyzeFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsAnalyzing(true)

    // Update status to analyzing
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'analyzing' as const } : f
      )
    )

    try {
      // Convert files to base64
      const documentsData = await Promise.all(
        pendingFiles.map(async (f) => {
          const base64 = await fileToBase64(f.file)
          return {
            imageData: base64.split(',')[1], // Remove data URL prefix
            mimeType: f.file.type,
            filename: f.file.name,
          }
        })
      )

      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: documentsData }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze documents')
      }

      const { documents: analyses } = await response.json()

      // Update files with analysis results
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status === 'analyzing') {
            const analysis = analyses.find(
              (a: any) => a.originalFilename === f.file.name
            )
            if (analysis) {
              return { ...f, status: 'analyzed' as const, analysis }
            }
            return { ...f, status: 'error' as const, error: 'Analysis failed' }
          }
          return f
        })
      )

      toast.success(`Analyzed ${analyses.length} document(s)`)
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'analyzing'
            ? { ...f, status: 'error' as const, error: 'Analysis failed' }
            : f
        )
      )
      toast.error('Failed to analyze documents')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFileTag = (index: number, tag: string) => {
    setFiles((prev) =>
      prev.map((f, i) =>
        i === index && f.analysis
          ? {
              ...f,
              analysis: { ...f.analysis, suggestedTag: tag as any },
            }
          : f
      )
    )
  }

  const saveDocuments = async () => {
    const analyzedFiles = files.filter((f) => f.status === 'analyzed')
    if (analyzedFiles.length === 0) return

    setIsSaving(true)
    try {
      // TODO: Implement actual document saving with file upload to S3/R2
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success(`Saved ${analyzedFiles.length} document(s)`)
      setFiles([])
      onUploadComplete?.()
    } catch (error) {
      toast.error('Failed to save documents')
    } finally {
      setIsSaving(false)
    }
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const analyzedCount = files.filter((f) => f.status === 'analyzed').length

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-violet-400 bg-violet-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-xl bg-violet-100 flex items-center justify-center">
            <Upload className="h-7 w-7 text-violet-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop documents here or click to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports images and PDFs • AI will analyze and tag automatically
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card className="divide-y">
          {files.map((f, index) => (
            <div key={index} className="p-4 flex items-start gap-4">
              {/* Preview Thumbnail */}
              <div
                className="h-16 w-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setPreviewFile(f)}
              >
                {f.file.type.startsWith('image/') ? (
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <File className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900 truncate">
                      {f.analysis?.suggestedName || f.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(f.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  {/* Status / Tag */}
                  <div className="flex items-center gap-2">
                    {f.status === 'pending' && (
                      <Badge variant="outline" className="text-gray-500">
                        Pending analysis
                      </Badge>
                    )}
                    {f.status === 'analyzing' && (
                      <Badge variant="outline" className="text-violet-600">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Analyzing...
                      </Badge>
                    )}
                    {f.status === 'analyzed' && f.analysis && (
                      <Select
                        value={f.analysis.suggestedTag}
                        onValueChange={(v) => updateFileTag(index, v)}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TAG_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {f.status === 'error' && (
                      <Badge variant="outline" className="text-red-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Analysis Details */}
                {f.status === 'analyzed' && f.analysis && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600">{f.analysis.description}</p>

                    {/* Confidence */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-24">
                        <div
                          className={`h-full rounded-full ${
                            f.analysis.confidence > 0.8
                              ? 'bg-emerald-500'
                              : f.analysis.confidence > 0.5
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${f.analysis.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.round(f.analysis.confidence * 100)}%
                      </span>
                    </div>

                    {/* Compliance Badge */}
                    {f.analysis.complianceRelevance?.couldSatisfyRule && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          May satisfy compliance rule
                        </Badge>
                        {f.analysis.complianceRelevance.isSigned && (
                          <Badge className="bg-blue-100 text-blue-700">
                            Signed
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Extracted Data */}
                    {f.analysis.extractedData?.decedentName && (
                      <p className="text-sm text-gray-600">
                        <span className="text-gray-500">Decedent:</span>{' '}
                        {f.analysis.extractedData.decedentName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {files.length} file(s) • {analyzedCount} analyzed • {pendingCount} pending
          </p>

          <div className="flex gap-3">
            {pendingCount > 0 && (
              <Button
                onClick={analyzeFiles}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze with AI
                  </>
                )}
              </Button>
            )}

            {analyzedCount > 0 && (
              <Button onClick={saveDocuments} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Confirm & Save
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.file.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewFile?.file.type.startsWith('image/') && (
              <img
                src={previewFile.preview}
                alt={previewFile.file.name}
                className="w-full rounded-lg"
              />
            )}
            {previewFile?.file.type === 'application/pdf' && (
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">PDF preview not available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
