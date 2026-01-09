'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, X, GripVertical, Mail } from 'lucide-react'
import { toast } from 'sonner'

type SignerRole = 'PRIMARY_CONTACT' | 'NEXT_OF_KIN' | 'PURCHASER' | 'DIRECTOR' | 'WITNESS' | 'OTHER'

interface Document {
  id: string
  name: string
  tag: string
}

interface Signer {
  name: string
  email: string
  role: SignerRole
  order: number
}

interface SignatureRequestSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
  onSuccess?: () => void
}

const roleLabels: Record<SignerRole, string> = {
  PRIMARY_CONTACT: 'Primary Contact',
  NEXT_OF_KIN: 'Next of Kin',
  PURCHASER: 'Purchaser',
  DIRECTOR: 'Director',
  WITNESS: 'Witness',
  OTHER: 'Other',
}

export function SignatureRequestSheet({
  open,
  onOpenChange,
  document,
  onSuccess,
}: SignatureRequestSheetProps) {
  const [signers, setSigners] = useState<Signer[]>([
    { name: '', email: '', role: 'PRIMARY_CONTACT', order: 1 },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddSigner = () => {
    setSigners([
      ...signers,
      { name: '', email: '', role: 'OTHER', order: signers.length + 1 },
    ])
  }

  const handleRemoveSigner = (index: number) => {
    if (signers.length === 1) return
    const newSigners = signers.filter((_, i) => i !== index)
    // Re-order signers
    setSigners(newSigners.map((s, i) => ({ ...s, order: i + 1 })))
  }

  const handleSignerChange = (
    index: number,
    field: keyof Signer,
    value: string | number
  ) => {
    const newSigners = [...signers]
    newSigners[index] = { ...newSigners[index], [field]: value }
    setSigners(newSigners)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate signers
    for (const signer of signers) {
      if (!signer.name.trim() || !signer.email.trim()) {
        toast.error('Please fill in all signer details')
        return
      }
    }

    if (!document) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          signers,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send signature request')
      }

      toast.success('Signature request sent successfully')
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setSigners([{ name: '', email: '', role: 'PRIMARY_CONTACT', order: 1 }])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send signature request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Send for Signature</SheetTitle>
          <SheetDescription>
            Send &quot;{document?.name}&quot; to be signed electronically.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Signers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSigner}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Signer
              </Button>
            </div>

            <div className="space-y-3">
              {signers.map((signer, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        #{signer.order}
                      </Badge>
                    </div>
                    {signers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveSigner(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={signer.name}
                        onChange={(e) => handleSignerChange(index, 'name', e.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Role</Label>
                      <Select
                        value={signer.role}
                        onValueChange={(v) => handleSignerChange(index, 'role', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={signer.email}
                      onChange={(e) => handleSignerChange(index, 'email', e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Request
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
