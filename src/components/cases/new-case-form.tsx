'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SERVICE_TYPE_LABELS, DISPOSITION_LABELS, CONTACT_ROLE_LABELS } from '@/types'
import type { ServiceType, Disposition, ContactRole } from '@prisma/client'

const formSchema = z.object({
  // Basics
  locationId: z.string().min(1, 'Location is required'),
  directorId: z.string().optional(),
  serviceType: z.enum(['TRADITIONAL', 'MEMORIAL', 'GRAVESIDE', 'DIRECT_CREMATION', 'DIRECT_BURIAL', 'CELEBRATION_OF_LIFE']),
  disposition: z.enum(['BURIAL', 'CREMATION', 'ENTOMBMENT', 'DONATION', 'TRANSFER']),
  serviceDate: z.date().optional(),
  serviceTime: z.string().optional(),

  // Decedent
  decedentFirstName: z.string().min(1, 'First name is required'),
  decedentMiddleName: z.string().optional(),
  decedentLastName: z.string().min(1, 'Last name is required'),
  decedentSuffix: z.string().optional(),
  decedentDob: z.date().optional(),
  decedentDod: z.date().optional(),
  decedentPlaceOfDeath: z.string().optional(),
  decedentAddress: z.string().optional(),
  decedentCity: z.string().optional(),
  decedentState: z.string().optional(),
  decedentZipCode: z.string().optional(),

  // Primary Contact
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactRole: z.enum(['NEXT_OF_KIN', 'INFORMANT', 'PURCHASER', 'AUTHORIZED_AGENT', 'CLERGY', 'OTHER']).optional(),

  // Notes
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NewCaseFormProps {
  locations: { id: string; name: string; isDefault: boolean }[]
  directors: { id: string; name: string }[]
  defaultLocationId?: string
  currentUserId: string
}

export function NewCaseForm({
  locations,
  directors,
  defaultLocationId,
  currentUserId,
}: NewCaseFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: defaultLocationId || '',
      directorId: currentUserId,
      serviceType: 'TRADITIONAL',
      disposition: 'BURIAL',
      decedentFirstName: '',
      decedentLastName: '',
      contactRole: 'NEXT_OF_KIN',
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create case')
      }

      const result = await response.json()
      toast.success('Case created successfully')
      router.push(`/app/cases/${result.data.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create case')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">New Case</h1>
          <p className="text-sm text-muted-foreground">Create a new case record</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Accordion type="multiple" defaultValue={['basics', 'decedent', 'contact']} className="space-y-4">
            {/* Basics Section */}
            <AccordionItem value="basics" className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <span className="font-medium">Case Basics</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="directorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Director</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select director" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {directors.map((director) => (
                              <SelectItem key={director.id} value={director.id}>
                                {director.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(SERVICE_TYPE_LABELS) as [ServiceType, string][]).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disposition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disposition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(DISPOSITION_LABELS) as [Disposition, string][]).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Service Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Decedent Section */}
            <AccordionItem value="decedent" className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <span className="font-medium">Decedent Information</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="decedentFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decedentMiddleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Middle name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decedentLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decedentSuffix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suffix</FormLabel>
                        <FormControl>
                          <Input placeholder="Jr., Sr., III" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decedentDob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decedentDod"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Death</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decedentPlaceOfDeath"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Place of Death</FormLabel>
                        <FormControl>
                          <Input placeholder="Hospital, residence, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decedentAddress"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decedentCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="decedentState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="decedentZipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP</FormLabel>
                          <FormControl>
                            <Input placeholder="ZIP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Contact Section */}
            <AccordionItem value="contact" className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <span className="font-medium">Primary Contact</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(555) 555-5555" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(CONTACT_ROLE_LABELS) as [ContactRole, string][]).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Notes Section */}
            <AccordionItem value="notes" className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <span className="font-medium">Notes</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes about this case..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Case
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
