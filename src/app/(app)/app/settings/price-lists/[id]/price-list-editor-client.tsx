'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Plus,
  Upload,
  Download,
  Trash2,
  Pencil,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Decimal } from '@prisma/client/runtime/library'

interface PriceListItem {
  id: string
  name: string
  description: string | null
  category: string | null
  price: Decimal
}

interface PriceList {
  id: string
  name: string
  effectiveDate: Date
  isActive: boolean
  items: PriceListItem[]
}

interface PriceListEditorClientProps {
  priceList: PriceList
  canEdit: boolean
}

const CATEGORIES = [
  'Professional Services',
  'Facilities',
  'Automotive',
  'Caskets',
  'Outer Burial Containers',
  'Urns',
  'Cremation',
  'Merchandise',
  'Other',
]

export function PriceListEditorClient({
  priceList: initialPriceList,
  canEdit,
}: PriceListEditorClientProps) {
  const [priceList, setPriceList] = useState(initialPriceList)
  const [items, setItems] = useState<PriceListItem[]>(initialPriceList.items)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Item dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PriceListItem | null>(null)
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
  })

  // Import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [csvData, setCsvData] = useState('')
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const filteredItems =
    filterCategory === 'all'
      ? items
      : items.filter((item) => item.category === filterCategory)

  const categories = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean))
  ) as string[]

  const handleOpenItemDialog = (item?: PriceListItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        price: String(item.price),
      })
    } else {
      setEditingItem(null)
      setItemForm({ name: '', description: '', category: '', price: '' })
    }
    setItemDialogOpen(true)
  }

  const handleSaveItem = () => {
    if (!itemForm.name.trim() || !itemForm.price) {
      toast.error('Name and price are required')
      return
    }

    const price = parseFloat(itemForm.price)
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price')
      return
    }

    if (editingItem) {
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: itemForm.name,
                description: itemForm.description || null,
                category: itemForm.category || null,
                price: price as unknown as Decimal,
              }
            : item
        )
      )
    } else {
      const newItem: PriceListItem = {
        id: `new-${Date.now()}`,
        name: itemForm.name,
        description: itemForm.description || null,
        category: itemForm.category || null,
        price: price as unknown as Decimal,
      }
      setItems([...items, newItem])
    }

    setHasChanges(true)
    setItemDialogOpen(false)
    toast.success(editingItem ? 'Item updated' : 'Item added')
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    setHasChanges(true)
    toast.success('Item removed')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/price-lists/${priceList.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.name,
            description: item.description,
            category: item.category,
            price: Number(item.price),
          })),
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      const { data } = await res.json()
      setItems(data.items)
      setHasChanges(false)
      toast.success('Price list saved')
    } catch {
      toast.error('Failed to save price list')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setCsvData(text)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast.error('Please enter or upload CSV data')
      return
    }

    setIsImporting(true)
    try {
      const res = await fetch(`/api/price-lists/${priceList.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData, replaceExisting }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to import')
      }

      const { data, imported } = await res.json()
      setItems(data.items)
      setImportDialogOpen(false)
      setCsvData('')
      setHasChanges(false)
      toast.success(`Imported ${imported} items`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to import CSV'
      )
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = () => {
    const headers = ['Name', 'Description', 'Category', 'Price']
    const rows = items.map((item) => [
      `"${item.name}"`,
      `"${item.description || ''}"`,
      `"${item.category || ''}"`,
      Number(item.price).toFixed(2),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${priceList.name.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalValue = items.reduce((sum, item) => sum + Number(item.price), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/settings/price-lists">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {priceList.name}
              </h1>
              {priceList.isActive && (
                <Badge className="bg-emerald-100 text-emerald-700">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Effective {format(new Date(priceList.effectiveDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => handleOpenItemDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Unsaved Changes Banner */}
      {hasChanges && canEdit && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-800">
                You have unsaved changes
              </p>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Price List Items</CardTitle>
            {categories.length > 0 && (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No items yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Add items manually or import from a CSV file
              </p>
              {canEdit && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setImportDialogOpen(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                  </Button>
                  <Button onClick={() => handleOpenItemDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  {canEdit && <TableHead className="w-20"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.category && (
                        <Badge variant="outline">{item.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(item.price).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenItemDialog(item)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Item' : 'Add Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="itemName">Name *</Label>
              <Input
                id="itemName"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm({ ...itemForm, name: e.target.value })
                }
                placeholder="e.g., Basic Services of Funeral Director"
              />
            </div>
            <div>
              <Label htmlFor="itemDesc">Description</Label>
              <Textarea
                id="itemDesc"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="itemCat">Category</Label>
              <Select
                value={itemForm.category}
                onValueChange={(v) =>
                  setItemForm({ ...itemForm, category: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemPrice">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.price}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, price: e.target.value })
                  }
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Upload CSV File</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full mt-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or paste CSV data
                </span>
              </div>
            </div>
            <div>
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={`Name,Description,Category,Price
Basic Services,Includes coordination,Professional Services,2995.00
Embalming,,Professional Services,795.00`}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="replaceExisting"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="replaceExisting" className="font-normal">
                Replace existing items (uncheck to add to existing)
              </Label>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium mb-1">Expected CSV format:</p>
              <ul className="text-muted-foreground text-xs space-y-0.5">
                <li>• First row must be headers</li>
                <li>• Required columns: Name, Price</li>
                <li>• Optional columns: Description, Category</li>
                <li>• Prices can include $ or be plain numbers</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false)
                setCsvData('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
