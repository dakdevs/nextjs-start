'use client'

import { useId } from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '~/components/shadcn/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/shadcn/select'
import { useFieldContext } from './contexts'
import { validationMessages } from './validation-messages'

export function SelectField({
  label,
  options,
  id,
  description,
  placeholder,
  required = false,
  disabled = false,
}: {
  label: string
  options: readonly { label: string; value: string }[]
  id?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}) {
  const field = useFieldContext<string>()

  const generatedId = useId()

  const controlId = id ?? generatedId

  const invalid = field.state.meta.isTouched && !field.state.meta.isValid

  const descriptionId =
    description === undefined ? undefined : `${controlId}-description`

  const errorId = `${controlId}-error`

  const describedBy =
    [descriptionId, invalid ? errorId : undefined].filter(Boolean).join(' ') ||
    undefined

  return (
    <Field
      data-invalid={invalid}
      data-disabled={disabled}
    >
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      <Select
        name={field.name}
        items={options}
        value={field.state.value}
        required={required}
        disabled={disabled}
        onValueChange={(value) => {
          if (value !== null) {
            field.handleChange(value)
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            field.handleBlur()
          }
        }}
      >
        <SelectTrigger
          id={controlId}
          className="w-full"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onBlur={field.handleBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {options.map((option) => {
              return (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              )
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      {description === undefined ? null : (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {invalid ? (
        <FieldError id={errorId}>
          {validationMessages(field.state.meta.errors).join(' ')}
        </FieldError>
      ) : null}
    </Field>
  )
}
