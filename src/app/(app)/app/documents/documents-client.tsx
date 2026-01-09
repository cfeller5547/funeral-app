'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Package, Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { TemplateList } from '@/components/documents/template-list'
import { PackList } from '@/components/documents/pack-list'
import { DocumentList } from '@/components/documents/document-list'
import { TemplateEditorDialog } from '@/components/documents/template-editor-dialog'
import { SmartUpload } from '@/components/documents/smart-upload'
import { toast } from 'sonner'

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

interface PackItem {
  template: {
    id: string
    name: string
    tag: DocumentTag
  }
}

interface Pack {
  id: string
  name: string
  description: string | null
  items: PackItem[]
  _count: {
    items: number
  }
  updatedAt: Date
}

type DocumentStatus = 'DRAFT' | 'GENERATED' | 'UPLOADED' | 'SENT_FOR_SIGNATURE' | 'SIGNED' | 'ARCHIVED'

interface Document {
  id: string
  name: string
  tag: DocumentTag
  status: DocumentStatus
  version: number
  createdAt: Date
  template: {
    name: string
    tag: DocumentTag
  } | null
  case: {
    caseNumber: string
    decedent: {
      firstName: string
      lastName: string
    } | null
  }
}

interface DocumentsClientProps {
  templates: Template[]
  packs: Pack[]
  documents: Document[]
}

export function DocumentsClient({
  templates: initialTemplates,
  packs: initialPacks,
  documents: initialDocuments,
}: DocumentsClientProps) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [packs] = useState(initialPacks)
  const [documents] = useState(initialDocuments)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setEditorOpen(true)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setEditorOpen(true)
  }

  const handleDeleteTemplate = async (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/documents/templates/${template.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete template')
      }

      setTemplates(templates.filter((t) => t.id !== template.id))
      toast.success('Template deleted')
    } catch {
      toast.error('Failed to delete template')
    }
  }

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const res = await fetch('/api/documents/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          tag: template.tag,
          content: template.content,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to duplicate template')
      }

      const { data } = await res.json()
      setTemplates([data, ...templates])
      toast.success('Template duplicated')
    } catch {
      toast.error('Failed to duplicate template')
    }
  }

  const handleTemplateSaved = (template: Template) => {
    if (editingTemplate) {
      setTemplates(templates.map((t) => (t.id === template.id ? template : t)))
    } else {
      setTemplates([template, ...templates])
    }
    setEditorOpen(false)
    toast.success(editingTemplate ? 'Template updated' : 'Template created')
  }

  const handleGeneratePack = (pack: Pack) => {
    // In a real implementation, this would open a dialog to select a case
    toast.info(`Select a case to generate the "${pack.name}" pack`)
  }

  const handleViewDocument = (doc: Document) => {
    // In a real implementation, this would open a document viewer
    toast.info(`Viewing document: ${doc.name}`)
  }

  const handleDownloadDocument = (doc: Document) => {
    // In a real implementation, this would download the document
    toast.info(`Downloading: ${doc.name}`)
  }

  const handleSendForSignature = (doc: Document) => {
    // In a real implementation, this would open the signature request dialog
    toast.info(`Send "${doc.name}" for signature`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Manage templates, packs, and generated documents
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="smart-upload" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Upload
          </TabsTrigger>
          <TabsTrigger value="templates">
            Templates
            {templates.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {templates.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="packs">
            Packs
            {packs.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {packs.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="generated">
            Generated Docs
            {documents.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {documents.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smart-upload">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    AI-Powered Document Upload
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Upload documents and let AI analyze, tag, and file them automatically
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SmartUpload onUploadComplete={() => toast.success('Documents uploaded successfully')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Document Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No templates yet"
                  description="Create document templates with merge fields and signature placeholders."
                  action={{
                    label: 'Create Template',
                    onClick: handleCreateTemplate,
                  }}
                  className="py-12"
                />
              ) : (
                <TemplateList
                  templates={templates}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onDuplicate={handleDuplicateTemplate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packs">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Template Packs</CardTitle>
            </CardHeader>
            <CardContent>
              {packs.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No packs yet"
                  description="Create packs to generate multiple documents at once."
                  action={{
                    label: 'Create Pack',
                    onClick: () => toast.info('Pack creation coming soon'),
                  }}
                  className="py-12"
                />
              ) : (
                <PackList
                  packs={packs}
                  onGenerate={handleGeneratePack}
                  onEdit={() => toast.info('Pack editing coming soon')}
                  onDelete={() => toast.info('Pack deletion coming soon')}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Generated Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents generated"
                  description="Documents generated from templates will appear here."
                  className="py-12"
                />
              ) : (
                <DocumentList
                  documents={documents}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  onSendForSignature={handleSendForSignature}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editingTemplate}
        onSave={handleTemplateSaved}
      />
    </div>
  )
}
