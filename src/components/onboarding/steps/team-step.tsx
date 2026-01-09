'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Users, Mail } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

interface Invite {
  email: string
  role: string
}

interface TeamStepProps {
  existingUsers: User[]
  invites: Invite[]
  onChange: (invites: Invite[]) => void
}

const ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Full access to all features' },
  { value: 'DIRECTOR', label: 'Director', description: 'Manage cases and documents' },
  { value: 'STAFF', label: 'Staff', description: 'View and update assigned cases' },
]

export function TeamStep({ existingUsers, invites, onChange }: TeamStepProps) {
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('STAFF')

  const addInvite = () => {
    if (!newEmail || invites.some((i) => i.email === newEmail)) return
    onChange([...invites, { email: newEmail, role: newRole }])
    setNewEmail('')
    setNewRole('STAFF')
  }

  const removeInvite = (email: string) => {
    onChange(invites.filter((i) => i.email !== email))
  }

  const getRoleLabel = (role: string) => {
    return ROLES.find((r) => r.value === role)?.label || role
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
        <p className="text-sm text-gray-500 mt-1">
          Invite your team to collaborate on FuneralOps
        </p>
      </div>

      {/* Existing Users */}
      {existingUsers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Current Team ({existingUsers.length})
          </h3>
          <div className="space-y-2">
            {existingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.name || user.email}</p>
                  {user.name && (
                    <p className="text-sm text-gray-500">{user.email}</p>
                  )}
                </div>
                <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Invites */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Invite Team Members
        </h3>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInvite()}
            />
          </div>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addInvite} disabled={!newEmail}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="space-y-2 mt-4">
            <Label className="text-xs text-gray-500">Pending Invites</Label>
            {invites.map((invite) => (
              <div
                key={invite.email}
                className="flex items-center justify-between p-3 bg-[oklch(0.45_0.12_180)]/5 rounded-lg border border-[oklch(0.45_0.12_180)]/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{invite.email}</span>
                  <Badge variant="outline">{getRoleLabel(invite.role)}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInvite(invite.email)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500">
          Invites will be sent when you complete setup. You can always add more team members later.
        </p>
      </div>
    </div>
  )
}
