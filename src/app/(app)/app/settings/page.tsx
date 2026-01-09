import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  MapPin,
  Users,
  FileText,
  Bell,
  Link as LinkIcon,
  Palette,
} from 'lucide-react'
import Link from 'next/link'

const settingSections = [
  {
    title: 'Organization',
    description: 'Manage organization details and billing',
    icon: Building2,
    href: '/app/settings/organization',
  },
  {
    title: 'Locations',
    description: 'Add and manage your funeral home locations',
    icon: MapPin,
    href: '/app/settings/locations',
  },
  {
    title: 'Users & Roles',
    description: 'Invite team members and manage permissions',
    icon: Users,
    href: '/app/settings/users',
  },
  {
    title: 'Price Lists',
    description: 'Manage GPL versions and pricing',
    icon: FileText,
    href: '/app/settings/price-lists',
  },
  {
    title: 'Notifications',
    description: 'Configure email and in-app notifications',
    icon: Bell,
    href: '/app/settings/notifications',
  },
  {
    title: 'Integrations',
    description: 'Connect email, eSignature, and storage providers',
    icon: LinkIcon,
    href: '/app/settings/integrations',
  },
  {
    title: 'Branding',
    description: 'Customize your portal appearance',
    icon: Palette,
    href: '/app/settings/branding',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization and application preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingSections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Demo Mode Indicator */}
      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
        <>
          <Separator />
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Demo Mode</CardTitle>
              <CardDescription>
                You're running in demo mode with sample data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                Reset Demo Data
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
