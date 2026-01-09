'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type DocumentTag =
  | 'GPL'
  | 'CONTRACT'
  | 'AUTHORIZATION_CREMATION'
  | 'AUTHORIZATION_EMBALMING'
  | 'AUTHORIZATION_DISPOSITION'
  | 'PERMIT_BURIAL'
  | 'PERMIT_TRANSIT'
  | 'DEATH_CERTIFICATE'
  | 'ID_VERIFICATION'
  | 'OBITUARY'
  | 'PROGRAM'
  | 'CHECKLIST'
  | 'OTHER'

interface Template {
  id: string
  name: string
  description: string | null
  tag: DocumentTag
  content: string
  isActive: boolean
  updatedAt: Date
}

interface TemplateEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  onSave: (template: Template) => void
}

const TAG_OPTIONS: { value: DocumentTag; label: string }[] = [
  { value: 'GPL', label: 'General Price List' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'AUTHORIZATION_CREMATION', label: 'Cremation Authorization' },
  { value: 'AUTHORIZATION_EMBALMING', label: 'Embalming Authorization' },
  { value: 'AUTHORIZATION_DISPOSITION', label: 'Disposition Authorization' },
  { value: 'PERMIT_BURIAL', label: 'Burial Permit' },
  { value: 'PERMIT_TRANSIT', label: 'Transit Permit' },
  { value: 'DEATH_CERTIFICATE', label: 'Death Certificate' },
  { value: 'ID_VERIFICATION', label: 'ID Verification' },
  { value: 'OBITUARY', label: 'Obituary' },
  { value: 'PROGRAM', label: 'Program' },
  { value: 'CHECKLIST', label: 'Checklist' },
  { value: 'OTHER', label: 'Other' },
]

const MERGE_FIELD_EXAMPLES = [
  '{{decedent.fullName}}',
  '{{decedent.dateOfBirth}}',
  '{{decedent.dateOfDeath}}',
  '{{case.caseNumber}}',
  '{{case.serviceDate}}',
  '{{primaryContact.fullName}}',
  '{{organization.name}}',
  '{{location.name}}',
  '{{currentDate}}',
]

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateEditorDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState<DocumentTag>('OTHER')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description || '')
      setTag(template.tag)
      setContent(template.content)
    } else {
      setName('')
      setDescription('')
      setTag('OTHER')
      setContent('')
    }
  }, [template, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = template
        ? `/api/documents/templates/${template.id}`
        : '/api/documents/templates'

      const res = await fetch(url, {
        method: template ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          tag,
          content,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save template')
      }

      const { data } = await res.json()
      onSave(data)
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertMergeField = (field: string) => {
    setContent((prev) => prev + field)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
          <DialogDescription>
            Create document templates with merge fields that will be replaced with case data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cremation Authorization"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag">Document Type</Label>
              <Select value={tag} onValueChange={(v) => setTag(v as DocumentTag)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TAG_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Template Content</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Info className="h-3 w-3 mr-1" />
                      Merge Fields
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-sm">
                    <p className="font-medium mb-2">Available merge fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {MERGE_FIELD_EXAMPLES.map((field) => (
                        <button
                          key={field}
                          type="button"
                          onClick={() => insertMergeField(field)}
                          className="text-xs bg-muted px-1.5 py-0.5 rounded hover:bg-muted-foreground/20 cursor-pointer"
                        >
                          {field}
                        </button>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter template content with merge fields like {{decedent.fullName}}..."
              className="min-h-[300px] font-mono text-sm"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
