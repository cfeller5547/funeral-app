'use client'

import { useState } from 'react'
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ArrowRight,
  Zap,
  MessageSquare,
  User,
  Phone,
  Mail,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface GeneratedTask {
  title: string
  description: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  dueInHours: number
  suggestedAssignee?: 'DIRECTOR' | 'ADMIN' | 'CURRENT_USER'
  relatedToCase?: boolean
}

interface StatusUpdate {
  type: 'STAGE_CHANGE' | 'SERVICE_UPDATE' | 'CONTACT_UPDATE' | 'NOTE'
  caseNumber?: string
  details: string
}

interface CaseUpdate {
  caseNumber?: string
  field: string
  value: string
  reason: string
}

interface TriageResult {
  tasks: GeneratedTask[]
  statusUpdates: StatusUpdate[]
  caseUpdates: CaseUpdate[]
  urgencyLevel: 'IMMEDIATE' | 'HIGH' | 'NORMAL' | 'LOW'
  summary: string
}

interface Case {
  id: string
  caseNumber: string
  decedent?: { firstName: string; lastName: string } | null
}

interface OpsTriageCopilotProps {
  cases?: Case[]
  onTasksCreated?: () => void
}

const SOURCE_OPTIONS = [
  { value: 'PHONE_CALL', label: 'Phone Call', icon: Phone },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'VOICEMAIL', label: 'Voicemail', icon: MessageSquare },
  { value: 'IN_PERSON', label: 'In Person', icon: User },
  { value: 'OTHER', label: 'Other', icon: MessageSquare },
]

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
}

const URGENCY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  IMMEDIATE: 'bg-red-100 text-red-700',
}

export function OpsTriageCopilot({ cases = [], onTasksCreated }: OpsTriageCopilotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [source, setSource] = useState<string>('PHONE_CALL')
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())
  const [isCreating, setIsCreating] = useState(false)

  const handleAnalyze = async () => {
    if (!notes.trim()) {
      toast.error('Please enter some notes to analyze')
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    try {
      const response = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: notes,
          source,
          caseId: selectedCaseId || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze notes')
      }

      const data = await response.json()
      setResult(data)

      // Select all tasks by default
      setSelectedTasks(new Set(data.tasks.map((_: GeneratedTask, i: number) => i)))

      toast.success('Analysis complete')
    } catch (error) {
      toast.error('Failed to analyze notes')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTasks(newSelected)
  }

  const handleCreateTasks = async () => {
    if (selectedTasks.size === 0 || !result) {
      toast.error('Please select at least one task')
      return
    }

    setIsCreating(true)

    try {
      // In a real implementation, this would create the tasks via API
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success(`Created ${selectedTasks.size} task(s)`)

      // Reset form
      setNotes('')
      setResult(null)
      setSelectedTasks(new Set())
      onTasksCreated?.()
    } catch (error) {
      toast.error('Failed to create tasks')
    } finally {
      setIsCreating(false)
    }
  }

  const handleReset = () => {
    setNotes('')
    setResult(null)
    setSelectedTasks(new Set())
    setSelectedCaseId('')
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle>Ops Triage Copilot</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Paste notes and let AI extract tasks
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Input Section */}
          {!result && (
            <>
              <div className="space-y-4">
                {/* Source & Case Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Source
                    </label>
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Related Case
                    </label>
                    <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific case</SelectItem>
                        {cases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.caseNumber} - {c.decedent?.firstName} {c.decedent?.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Notes / Message
                  </label>
                  <Textarea
                    placeholder="Paste phone call notes, email content, voicemail transcription, or any message that needs action..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !notes.trim()}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze & Extract Tasks
                  </>
                )}
              </Button>
            </>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Badge className={URGENCY_COLORS[result.urgencyLevel]}>
                    {result.urgencyLevel === 'IMMEDIATE' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {result.urgencyLevel}
                  </Badge>
                  <p className="text-sm text-muted-foreground flex-1">
                    {result.summary}
                  </p>
                </div>
              </Card>

              {/* Generated Tasks */}
              {result.tasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground">
                      Generated Tasks ({result.tasks.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedTasks.size === result.tasks.length) {
                          setSelectedTasks(new Set())
                        } else {
                          setSelectedTasks(new Set(result.tasks.map((_, i) => i)))
                        }
                      }}
                    >
                      {selectedTasks.size === result.tasks.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {result.tasks.map((task, index) => (
                      <Card
                        key={index}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedTasks.has(index)
                            ? 'border-violet-300 bg-violet-50'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleTask(index)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center ${
                              selectedTasks.has(index)
                                ? 'border-violet-500 bg-violet-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedTasks.has(index) && (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground">
                                {task.title}
                              </p>
                              <Badge className={PRIORITY_COLORS[task.priority]} variant="outline">
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due in {task.dueInHours}h
                              </span>
                              {task.suggestedAssignee && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {task.suggestedAssignee.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Updates */}
              {result.statusUpdates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Suggested Updates ({result.statusUpdates.length})
                  </h3>
                  <div className="space-y-2">
                    {result.statusUpdates.map((update, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {update.type.replace('_', ' ')}
                          </Badge>
                          {update.caseNumber && (
                            <span className="text-xs text-muted-foreground">
                              Case {update.caseNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{update.details}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Case Updates */}
              {result.caseUpdates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Case Information Updates ({result.caseUpdates.length})
                  </h3>
                  <div className="space-y-2">
                    {result.caseUpdates.map((update, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {update.field}
                          </span>
                          {update.caseNumber && (
                            <span className="text-xs text-muted-foreground">
                              Case {update.caseNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-violet-600 font-medium">{update.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{update.reason}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
                <Button
                  onClick={handleCreateTasks}
                  disabled={isCreating || selectedTasks.size === 0}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create {selectedTasks.size} Task(s)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
