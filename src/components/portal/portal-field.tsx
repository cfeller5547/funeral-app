'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePortalForm } from './portal-form-wrapper'
import { cn } from '@/lib/utils'

interface PortalFieldProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  className?: string
}

export function PortalField({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  options,
  className,
}: PortalFieldProps) {
  const { formData, updateField } = usePortalForm()
  const value = (formData[name] as string) || ''

  const inputClassName = cn(
    'min-h-[44px] text-base', // Large touch target
    className
  )

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === 'textarea' ? (
        <Textarea
          id={name}
          value={value}
          onChange={(e) => updateField(name, e.target.value)}
          placeholder={placeholder}
          className={cn(inputClassName, 'min-h-[120px]')}
        />
      ) : type === 'select' ? (
        <Select value={value} onValueChange={(v) => updateField(name, v)}>
          <SelectTrigger className={inputClassName}>
            <SelectValue placeholder={placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={name}
          type={type}
          value={value}
          onChange={(e) => updateField(name, e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
      )}
    </div>
  )
}
