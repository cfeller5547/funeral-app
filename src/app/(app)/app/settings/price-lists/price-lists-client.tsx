'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Plus,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/shared/empty-state'
import { toast } from 'sonner'

interface PriceList {
  id: string
  name: string
  effectiveDate: Date
  isActive: boolean
  _count: { items: number }
}

interface PriceListsClientProps {
  priceLists: PriceList[]
  canEdit: boolean
}

export function PriceListsClient({
  priceLists: initialPriceLists,
  canEdit,
}: PriceListsClientProps) {
  const [priceLists, setPriceLists] = useState(initialPriceLists)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListDate, setNewListDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  )
  const [copyFromId, setCopyFromId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a name')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/price-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          effectiveDate: newListDate,
          copyFromId: copyFromId || undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to create price list')

      const { data } = await res.json()
      setPriceLists([data, ...priceLists])
      setCreateDialogOpen(false)
      setNewListName('')
      setCopyFromId('')
      toast.success('Price list created')
    } catch {
      toast.error('Failed to create price list')
    } finally {
      setIsCreating(false)
    }
  }

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/price-lists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })

      if (!res.ok) throw new Error('Failed to activate')

      setPriceLists(
        priceLists.map((pl) => ({
          ...pl,
          isActive: pl.id === id,
        }))
      )
      toast.success('Price list activated')
    } catch {
      toast.error('Failed to activate price list')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price list?')) return

    try {
      const res = await fetch(`/api/price-lists/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }

      setPriceLists(priceLists.filter((pl) => pl.id !== id))
      toast.success('Price list deleted')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete price list'
      )
    }
  }

  const handleDuplicate = (id: string) => {
    const source = priceLists.find((pl) => pl.id === id)
    if (source) {
      setNewListName(`${source.name} (Copy)`)
      setCopyFromId(id)
      setCreateDialogOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Price Lists (GPL)
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your General Price List versions
            </p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Price List
          </Button>
        )}
      </div>

      {/* Active Price List Banner */}
      {priceLists.some((pl) => pl.isActive) && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">
                  Active:{' '}
                  {priceLists.find((pl) => pl.isActive)?.name}
                </p>
                <p className="text-sm text-emerald-700">
                  Effective{' '}
                  {format(
                    new Date(
                      priceLists.find((pl) => pl.isActive)?.effectiveDate ||
                        new Date()
                    ),
                    'MMMM d, yyyy'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Lists */}
      {priceLists.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No price lists yet"
          description="Create your first GPL to track pricing for services and merchandise."
          action={
            canEdit
              ? {
                  label: 'Create Price List',
                  onClick: () => setCreateDialogOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {priceLists.map((priceList) => (
            <Card
              key={priceList.id}
              className={
                priceList.isActive ? 'ring-2 ring-emerald-500' : undefined
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {priceList.name}
                      {priceList.isActive && (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Effective{' '}
                      {format(
                        new Date(priceList.effectiveDate),
                        'MMM d, yyyy'
                      )}
                    </p>
                  </div>
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/app/settings/price-lists/${priceList.id}`}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Items
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(priceList.id)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {!priceList.isActive && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleActivate(priceList.id)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Set as Active
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(priceList.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {priceList._count.items} items
                  </span>
                  <Link href={`/app/settings/price-lists/${priceList.id}`}>
                    <Button variant="outline" size="sm">
                      View Items
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {copyFromId ? 'Duplicate Price List' : 'Create Price List'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., GPL 2025"
              />
            </div>
            <div>
              <Label htmlFor="date">Effective Date</Label>
              <Input
                id="date"
                type="date"
                value={newListDate}
                onChange={(e) => setNewListDate(e.target.value)}
              />
            </div>
            {!copyFromId && priceLists.length > 0 && (
              <div>
                <Label htmlFor="copyFrom">Copy items from (optional)</Label>
                <select
                  id="copyFrom"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={copyFromId}
                  onChange={(e) => setCopyFromId(e.target.value)}
                >
                  <option value="">Start fresh</option>
                  {priceLists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl._count.items} items)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setCopyFromId('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
