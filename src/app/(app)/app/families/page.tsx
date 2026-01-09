import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Send } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export default function FamiliesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Families</h1>
          <p className="text-sm text-muted-foreground">
            Manage family portal access and track responses
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portal Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="No active portal sessions"
            description="When you send portal links to families, their progress will appear here."
            className="py-12"
          />
        </CardContent>
      </Card>
    </div>
  )
}
