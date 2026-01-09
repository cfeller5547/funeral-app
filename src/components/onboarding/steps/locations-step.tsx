'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, MapPin } from 'lucide-react'

interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
}

interface LocationsStepProps {
  locations: Location[]
  onChange: (locations: Location[]) => void
}

export function LocationsStep({ locations, onChange }: LocationsStepProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const addLocation = () => {
    const newLocation: Location = {
      id: `new-${Date.now()}`,
      name: '',
      address: null,
      city: null,
      state: null,
      phone: null,
    }
    onChange([...locations, newLocation])
    setEditingId(newLocation.id)
  }

  const updateLocation = (id: string, updates: Partial<Location>) => {
    onChange(
      locations.map((loc) =>
        loc.id === id ? { ...loc, ...updates } : loc
      )
    )
  }

  const removeLocation = (id: string) => {
    if (locations.length <= 1) return
    onChange(locations.filter((loc) => loc.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Locations</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add your funeral home location(s)
        </p>
      </div>

      <div className="space-y-4">
        {locations.map((location) => (
          <Card key={location.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[oklch(0.45_0.12_180)]" />
                  <span className="font-medium">{location.name || 'New Location'}</span>
                </div>
                {locations.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              {(editingId === location.id || !location.name) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Location Name</Label>
                    <Input
                      value={location.name}
                      onChange={(e) =>
                        updateLocation(location.id, { name: e.target.value })
                      }
                      placeholder="e.g., Main Chapel"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={location.address || ''}
                      onChange={(e) =>
                        updateLocation(location.id, { address: e.target.value })
                      }
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={location.city || ''}
                      onChange={(e) =>
                        updateLocation(location.id, { city: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={location.state || ''}
                      onChange={(e) =>
                        updateLocation(location.id, { state: e.target.value })
                      }
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={location.phone || ''}
                      onChange={(e) =>
                        updateLocation(location.id, { phone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {editingId !== location.id && location.name && (
                <div className="text-sm text-gray-500">
                  {[location.address, location.city, location.state]
                    .filter(Boolean)
                    .join(', ') || 'No address provided'}
                  {location.phone && ` | ${location.phone}`}
                </div>
              )}
            </div>
          </Card>
        ))}

        <Button variant="outline" onClick={addLocation} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Location
        </Button>
      </div>
    </div>
  )
}
