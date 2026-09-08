'use client'

import { useId, type ComponentProps, type ReactNode } from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '~/components/shadcn/field'
import { Input } from '~/components/shadcn/input'
import { useFieldContext } from './contexts'
import { validationMessages } from './validation-messages'

type TextFieldProps = Omit<
  ComponentProps<typeof Input>,
  | 'value'
  | 'defaultValue'
  | 'name'
  | 'onChange'
  | 'onBlur'
  | 'aria-invalid'
  | 'aria-describedby'
> & { label: string; description?: string; labelAction?: ReactNode }

export function TextField({
  label,
  description,
  labelAction,
  id,
  ...props
}: TextFieldProps) {
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
      data-disabled={props.disabled}
    >
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
        {labelAction}
      </div>
      <Input
        {...props}
        id={controlId}
        name={field.name}
        value={field.state.value}
        onChange={(event) => {
          field.handleChange(event.target.value)
        }}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
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
